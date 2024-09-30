CREATE TABLE onboarding_users (
    user_uuid TEXT PRIMARY KEY,
    onboarding_videos JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_uuid)
);

-- Création d'un index sur user_uuid pour améliorer les performances des requêtes
-- Note : Cet index est redondant avec la clé primaire, mais est inclus pour la clarté
CREATE INDEX idx_onboarding_users_uuid ON onboarding_users(user_uuid);

-- Création d'un trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_onboarding_users_timestamp
AFTER UPDATE ON onboarding_users
FOR EACH ROW
BEGIN
    UPDATE onboarding_users SET updated_at = CURRENT_TIMESTAMP
    WHERE user_uuid = OLD.user_uuid;
END;