import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

// Création d'un son discret (base64) pour éviter les problèmes de chemin de fichier
// C'est un son "Pop" très court et très discret.
const popSound = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExEAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'); 
// NB: J'utiliserai un "vrai" beep généré via l'API WebAudio pour être sûr que ça marche sans fichier mp3 externe.

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSeenNotificationId, setLastSeenNotificationId] = useState(null);
    const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = useState(() => {
        return localStorage.getItem('desktopNotificationsEnabled') === 'true';
    });

    // Joue un petit son (Web Audio API) deux fois avec 1 seconde d'intervalle
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            // Un petit son aigu rapide (ding)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.error("Audio API non supportée", e);
        }
    };

    const playDoubleNotificationSound = () => {
        playNotificationSound();
        setTimeout(() => {
            playNotificationSound();
        }, 1000); // 1 seconde d'intervalle
    };

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const res = await notificationService.getUnreadCount();
            const newCount = res.data.unread_count;
            
            // Si le nombre a augmenté, c'est qu'on a de nouvelles notifications non lues
            if (newCount > unreadCount) {
                playDoubleNotificationSound();
                // On met à jour la liste complète si on a la sidebar ouverte ou pour afficher le popup
                fetchNotifications();
            }
            
            setUnreadCount(newCount);
        } catch (error) {
            console.error('Erreur lors du fetch des notifications non lues', error);
        }
    }, [user, unreadCount]);

    const fetchNotifications = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await notificationService.getNotifications(1); // Page 1 pour le polling
            const fetchedNotifications = res.data.data || [];
            
            if (fetchedNotifications.length > 0) {
                const latest = fetchedNotifications[0];
                if (lastSeenNotificationId && latest.id !== lastSeenNotificationId) {
                    if (desktopNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                        const notif = new Notification(latest.data.title || 'Nouvelle notification', {
                            body: latest.data.message || '',
                            icon: '/logo.png',
                            tag: latest.id
                        });
                        notif.onclick = () => {
                            window.focus();
                            if (latest.data.action_url) {
                                window.location.href = latest.data.action_url;
                            }
                        };
                    }
                }
                setLastSeenNotificationId(latest.id);
            }
            
            setNotifications(fetchedNotifications);
        } catch (error) {
            console.error('Erreur lors du fetch des notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (error) {
            console.error('Erreur markAsRead', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        } catch (error) {
            console.error('Erreur markAllAsRead', error);
        }
    };

    const deleteAllNotifications = async () => {
        try {
            await notificationService.deleteAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Erreur deleteAllNotifications', error);
            throw error;
        }
    };

    // Polling toutes les 30 secondes
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            fetchNotifications(); // Fetch initial
            
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 30000); // 30 secondes
            
            return () => clearInterval(interval);
        }
    }, [user, fetchUnreadCount]);

    const toggleDesktopNotifications = async () => {
        if (!('Notification' in window)) {
            alert('Ce navigateur ne supporte pas les notifications de bureau.');
            return;
        }

        if (!desktopNotificationsEnabled) {
            let permission = Notification.permission;
            if (permission !== 'granted') {
                permission = await Notification.requestPermission();
            }
            if (permission === 'granted') {
                setDesktopNotificationsEnabled(true);
                localStorage.setItem('desktopNotificationsEnabled', 'true');
                new Notification('Notifications activées', {
                    body: 'Vous recevrez désormais des alertes pour les nouvelles notifications.',
                    icon: '/logo.png'
                });
            }
        } else {
            setDesktopNotificationsEnabled(false);
            localStorage.setItem('desktopNotificationsEnabled', 'false');
        }
    };

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            notifications,
            isLoading,
            desktopNotificationsEnabled,
            fetchNotifications,
            markAsRead,
            markAllAsRead,
            deleteAllNotifications,
            toggleDesktopNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
