const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors'); // Importer Doctors.js
const dotenv = require('dotenv');
const { authenticate } = require('./middleware/auth');
const multer = require('multer');
const { Dropbox } = require('dropbox');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const userManagerRoutes = require('./routes/usermanager');
const UserManage = require('./models/UserManage'); // Renommé ici
const connectsRouter = require('./routes/connects'); // Importer les routes des connexions
const usersRoutes = require('./routes/users');
const loginHistoryRoutes = require('./routes/loginHistory');
const notificationsRoutes = require('./routes/notifications');

const paymentRoutes = require('./routes/payments');
const fichiersRouter = require("./routes/fichiers");
const alertRoutes = require('./routes/alertRoutes');





dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Configuration Dropbox
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

// Configuration de Multer pour gérer les fichiers en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Message hello world
app.get('/', (req, res) => {
    res.send("Hello WORLD !");
});


// Route pour obtenir tous les utilisateurs
app.get('/users', async (req, res) => {
    try {
      const users = await UserManage.find(); // Utilisation de UserManage ici
      res.json(users);
    } catch (err) {
      res.status(500).send('Erreur de récupération des utilisateurs');
    }
  });
  
  // Route pour ajouter un utilisateur
  app.post('/users', async (req, res) => {
    try {
      const newUser = new UserManage(req.body); // Utilisation de UserManage ici
      await newUser.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).send('Erreur lors de l\'ajout de l\'utilisateur');
    }
  });
  
  // Route pour modifier un utilisateur
  app.put('/users/:id', async (req, res) => {
    try {
      const updatedUser = await UserManage.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Utilisation de UserManage ici
      res.json(updatedUser);
    } catch (err) {
      res.status(500).send('Erreur lors de la mise à jour de l\'utilisateur');
    }
  });
  
  // Route pour supprimer un utilisateur
  app.delete('/users/:id', async (req, res) => {
    try {
      await UserManage.findByIdAndDelete(req.params.id); // Utilisation de UserManage ici
      res.status(200).send('Utilisateur supprimé');
    } catch (err) {
      res.status(500).send('Erreur lors de la suppression de l\'utilisateur');
    }
  });




// Route pour uploader un fichier vers Dropbox
app.post('/files', upload.single('file'), async (req, res) => {
    const { patientId } = req.body; // Assurez-vous que le patientId est envoyé avec le fichier
    const file = req.file;

    if (!file) return res.status(400).send('Aucun fichier sélectionné.');

    try {
        // Chemin dans Dropbox
        const dropboxPath = `/${patientId}/${file.originalname}`;
        // Envoi du fichier vers Dropbox
        const response = await dbx.filesUpload({
            path: dropboxPath,
            contents: file.buffer,
            mode: 'add',
        });

        // Générer un lien de partage
        const link = await dbx.sharingCreateSharedLinkWithSettings({ path: response.result.path_display });
        
        res.status(201).json({
            patientId,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileUrl: link.result.url.replace('?dl=0', '?raw=1'), // Lien direct vers le fichier
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Erreur lors du téléchargement vers Dropbox:', error);
        res.status(500).send('Erreur lors du téléchargement du fichier vers Dropbox.');
    }
});

// Route pour récupérer tous les fichiers d'un patient depuis Dropbox
app.get('/files/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        const result = await dbx.filesListFolder({ path: `/${patientId}` });
        const files = await Promise.all(
            result.result.entries.map(async (file) => {
                const link = await dbx.sharingCreateSharedLinkWithSettings({ path: file.path_display });
                return {
                    patientId,
                    fileName: file.name,
                    fileType: path.extname(file.name),
                    fileUrl: link.result.url.replace('?dl=0', '?raw=1'),
                    timestamp: new Date(file.server_modified).toISOString(),
                };
            })
        );
        res.json(files);
    } catch (error) {
        console.error('Erreur lors de la récupération des fichiers depuis Dropbox:', error);
        res.status(500).send('Erreur lors de la récupération des fichiers.');
    }
});

// Route pour supprimer un fichier depuis Dropbox
app.delete('/files/:patientId/:fileName', async (req, res) => {
    const { patientId, fileName } = req.params;

    try {
        await dbx.filesDeleteV2({ path: `/${patientId}/${fileName}` });
        res.json({ message: 'Fichier supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        res.status(500).send('Erreur lors de la suppression du fichier.');
    }
});




///partie  historique de connexion




//Fin Partie Historique 


////Partie Programme Operatoire


// Créer un modèle MongoDB pour les fichiers
const File = mongoose.model('File', new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  content: Buffer,  // Le contenu du fichier (en buffer, pour les fichiers texte par exemple)
  title: { type: String, default: '' },
}));





// API pour uploader un fichier
app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const filesData = req.files.map(file => {
      return new File({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        content: file.buffer, // Stockage du contenu du fichier dans la base de données
      });
    });

    // Sauvegarde les fichiers dans MongoDB
    const savedFiles = await File.insertMany(filesData);

    res.status(200).json(savedFiles);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'upload des fichiers' });
  }
});

// API pour récupérer les fichiers
// Assurez-vous que votre route GET renvoie bien le contenu du fichier (par exemple pour un fichier texte)
app.get('/files', async (req, res) => {
  try {
    const files = await File.find();
    // Ici on transforme le contenu en chaîne de caractères pour l'afficher (par exemple, en texte)
    const filesWithContent = files.map(file => ({
      ...file.toObject(),
      content: file.content.toString('utf-8'), // Ici on transforme le buffer en texte
    }));
    res.status(200).json(filesWithContent);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des fichiers' });
  }
});

// API pour supprimer un fichier
app.delete('/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findByIdAndDelete(fileId);

    if (!file) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    res.status(200).json({ message: 'Fichier supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
  }
});

// API pour mettre à jour le titre d'un fichier
app.put('/files/:id/title', async (req, res) => {
  try {
    const fileId = req.params.id;
    const { title } = req.body;

    const file = await File.findByIdAndUpdate(fileId, { title }, { new: true });

    if (!file) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    res.status(200).json(file);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du titre' });
  }
});

///Fin Partie Programme Operatoire

////Partie Observatio 

///fin partie observation



//Partie histoire de connexions

// Auth History Schema
const authHistorySchema = new mongoose.Schema({
  name: String,
  date: { type: Date, default: Date.now },
  status: String
});

const AuthHistory = mongoose.model('AuthHistory', authHistorySchema);

// Routes
app.get('/auth-history', async (req, res) => {
  try {
    const history = await AuthHistory.find().sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/auth-history', async (req, res) => {
  try {
    const newEntry = new AuthHistory(req.body);
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/auth-history/:id', async (req, res) => {
  try {
    await AuthHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



//Fin histoire de connexions


//notifications

// Notifications endpoints
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  const notification = new Notification({
    message: req.body.message,
    type: req.body.type,
    user: req.body.user,
    timestamp: new Date()
  });

  try {
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//fin notifications

///Partie alerte
/// Définir un modèle pour les alertes
const Alert = mongoose.models.Alert || mongoose.model('Alert', new mongoose.Schema({
  message: { type: String, required: true },
}, { timestamps: true }));



// Endpoint pour ajouter une alerte
app.post('/api/alerts', async (req, res) => {
  try {
    const alert = new Alert({ message: req.body.message });
    await alert.save();
    res.status(201).send(alert);
  } catch (error) {
    res.status(500).send({ error: 'Erreur lors de l\'ajout de l\'alerte' });
  }
});

// Endpoint pour récupérer toutes les alertes
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.status(200).send(alerts);
  } catch (error) {
    res.status(500).send({ error: 'Erreur lors de la récupération des alertes' });
  }
});

// Endpoint pour supprimer une alerte par ID
app.delete('/api/alerts/:id', async (req, res) => {
  const { id } = req.params;  // Extraire l'ID de l'alerte à supprimer
  try {
    const alert = await Alert.findByIdAndDelete(id);  // Supprimer l'alerte par son ID
    if (!alert) {
      return res.status(404).send({ error: 'Alerte non trouvée' });  // Si l'alerte n'est pas trouvée
    }
    res.status(200).send({ message: 'Alerte supprimée avec succès', alert });
  } catch (error) {
    res.status(500).send({ error: 'Erreur lors de la suppression de l\'alerte' });
  }
});
///Fin alerte




// Routes d'authentification et d'autres ressources
app.use('/api/auth', authRoutes);
app.use('/api/patients', authenticate, patientRoutes);
app.use('/api/doctors', authenticate, doctorRoutes); // Ajouter la route pour Doctors.js
app.use('/api', userManagerRoutes); // Préfixer les routes avec '/api'
app.use('/api', loginHistoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/api/fichiers", fichiersRouter);
app.use('/connects', connectsRouter);
// Routes
app.use('/api', usersRoutes);
app.use('/api/login-history', loginHistoryRoutes);
app.use('/api', notificationsRoutes);

app.use('/alertRoutes', alertRoutes);



// Port de l'application
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
