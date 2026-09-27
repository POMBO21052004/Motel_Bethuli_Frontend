/**
 * Modèle User — Représente un utilisateur du système
 * Les constantes sont centralisées dans `src/constants/index.js`
 */
export { USER_ROLES, USER_ROLE_LABELS, USER_ROLE_COLORS } from '../constants';
import { getInitials } from '../utils';

/**
 * Factory : crée un objet User avec valeurs par défaut
 */
export const createUser = (data = {}) => ({
    id: data.id || null,
    nom: data.nom || '',
    prenom: data.prenom || '',
    email: data.email || '',
    role: data.role || 'gestionnaire',
    actif: data.actif !== undefined ? data.actif : true,
    profil: data.profil || null,
    code_phone: data.code_phone || '+237',
    phone: data.phone || '',
    sexe: data.sexe || '',
    date_naissance: data.date_naissance || '',
    is_verified: data.is_verified || false,
    last_login: data.last_login || null,
    created_at: data.created_at || null,
});

/** Retourne le nom complet de l'utilisateur */
export const getUserFullName = (user) =>
    user ? `${user.prenom} ${user.nom}`.trim() : '';

/** Retourne les initiales pour l'avatar */
export const getUserInitials = (user) =>
    user ? getInitials(user.prenom, user.nom) : '?';

