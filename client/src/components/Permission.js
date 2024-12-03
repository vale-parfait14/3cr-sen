const permissions = {
    TRANSFER_PATIENT: 'transfer_patient',
    VIEW_SERVICES: 'view_services',
    MANAGE_PATIENTS: 'manage_patients'
  };
  
  const checkPermission = (permission) => {
    return (req, res, next) => {
      const userRole = req.user.role;
      const userPermissions = getRolePermissions(userRole);
      
      if (userPermissions.includes(permission)) {
        next();
      } else {
        res.status(403).json({ message: "Accès non autorisé" });
      }
    };
  };
  
  const getRolePermissions = (role) => {
    const permissionMap = {
      admin: [
        permissions.TRANSFER_PATIENT,
        permissions.VIEW_SERVICES,
        permissions.MANAGE_PATIENTS
      ],
      doctor: [
        permissions.VIEW_SERVICES,
        permissions.MANAGE_PATIENTS
      ],
      nurse: [
        permissions.VIEW_SERVICES
      ]
    };
    
    return permissionMap[role] || [];
  };
  
  module.exports = {
    permissions,
    checkPermission
  };
  