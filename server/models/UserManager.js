const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json'); // On utilise un fichier pour stocker les utilisateurs.

class UserManager {
  constructor() {
    this.loadUsers(); // Charger les utilisateurs dès la création de l'instance
  }

  // Charger les utilisateurs depuis le fichier JSON
  loadUsers() {
    try {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      this.users = JSON.parse(data);
    } catch (err) {
      this.users = [];
    }
  }

  // Sauvegarder les utilisateurs dans le fichier JSON
  saveUsers() {
    fs.writeFileSync(usersFilePath, JSON.stringify(this.users, null, 2), 'utf8');
  }

  // Ajouter un utilisateur
  addUser(user) {
    this.users.push(user);
    this.saveUsers();
  }

  // Modifier un utilisateur
  updateUser(id, updatedUser) {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updatedUser };
      this.saveUsers();
      return this.users[index];
    }
    return null;
  }

  // Supprimer un utilisateur
  deleteUser(id) {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      const deletedUser = this.users.splice(index, 1);
      this.saveUsers();
      return deletedUser[0];
    }
    return null;
  }

  // Récupérer tous les utilisateurs
  getAllUsers() {
    return this.users;
  }

  // Récupérer un utilisateur par ID
  getUserById(id) {
    return this.users.find(user => user.id === id);
  }
}

module.exports = new UserManager();
