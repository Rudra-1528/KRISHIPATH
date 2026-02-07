import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useUser } from './UserContext';

// Email alert config (EmailJS). Fill your keys in .env or inline before enabling.
const EMAIL_ENABLED = true;
const DEFAULT_EMAIL = 'demo@harvest.link';
const emailConfig = {
	serviceId: import.meta.env?.VITE_EMAILJS_SERVICE_ID,
	templateId: import.meta.env?.VITE_EMAILJS_TEMPLATE_ID,
	publicKey: import.meta.env?.VITE_EMAILJS_PUBLIC_KEY,
};

const NotificationContext = createContext();

export const useNotifications = () => {
	const ctx = useContext(NotificationContext);
	if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
	return ctx;
};

const buildNotification = ({ id, type, category, message, value, severity }) => ({
	id,
	type,
	category,
	message,
	value,
	truck: 'GJ-01-LIVE',
	severity,
	timestamp: Date.now(),
	isRead: false,
});

const sendEmailAlert = async (notification, toEmail) => {
	if (!EMAIL_ENABLED) return;
	const { serviceId, templateId, publicKey } = emailConfig;
	if (!serviceId || !templateId || !publicKey) {
		console.warn('Email alerts skipped: EmailJS config missing.');
		return;
	}

	try {
		await fetch('https://api.emailjs.com/api/v1.0/email/send', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				service_id: serviceId,
				template_id: templateId,
				user_id: publicKey,
				template_params: {
					to_email: toEmail || DEFAULT_EMAIL,
					subject: `KRISHIPATH Alert • ${notification.type || 'Alert'} • ${notification.truck || 'GJ-01-LIVE'}`,
					message: notification.message || notification.value || 'New alert',
					severity: notification.severity || 'info',
					truck: notification.truck || 'GJ-01-LIVE',
					category: notification.category || 'sensor',
					value: notification.value || '',
					timestamp: new Date(notification.timestamp || Date.now()).toISOString(),
				},
			}),
		});
	} catch (err) {
		console.warn('Email alert send failed', err);
	}
};

export const NotificationProvider = ({ children }) => {
	const { user } = useUser();
	const [allNotifications, setAllNotifications] = useState([]);
	// Use logged-in user's email if available, otherwise fall back to stored preference or default
	const [recipientEmail, setRecipientEmail] = useState(
		user?.email || localStorage.getItem('alert_email_recipient') || DEFAULT_EMAIL
	);
	const [sentEmailIds, setSentEmailIds] = useState(new Set());

	// Update recipient email whenever user logs in/out
	useEffect(() => {
		if (user?.email) {
			setRecipientEmail(user.email);
		}
	}, [user?.email]);

	// Load dedup set for the current recipient email
	useEffect(() => {
		try {
			const key = `sent_email_ids_${recipientEmail || DEFAULT_EMAIL}`;
			const raw = localStorage.getItem(key);
			setSentEmailIds(raw ? new Set(JSON.parse(raw)) : new Set());
		} catch (e) {
			setSentEmailIds(new Set());
		}
	}, [recipientEmail]);

	useEffect(() => {
		let unsubscribe = () => {};
		try {
			const coll = collection(db, 'shipments');
			unsubscribe = onSnapshot(coll, (snapshot) => {
				try {
					const now = Date.now();
					const incoming = [];

					snapshot.forEach((doc) => {
						const data = doc?.data?.() ? doc.data() : doc.data();
						if (!data || (data.truck_id && data.truck_id !== 'GJ-01-LIVE')) return;

						const lastUpdated = data.last_updated ? Number(data.last_updated) : 0;
						const isOffline = now - lastUpdated > 20000;
						const truck = data.truck_id || 'GJ-01-LIVE';

						if (isOffline) {
							incoming.push(
								buildNotification({
									id: `offline-${truck}`,
									type: 'connection',
									category: 'fleet',
									message: 'GJ-01-LIVE: connection lost / no signal',
									value: 'Offline',
									severity: 'critical',
								})
							);
							return;
						}

						const sensors = data.sensors || {};
						const temp = Number(sensors.temp ?? sensors.temperature ?? 0) || 0;
						const humidity = Number(sensors.humidity ?? 100) || 100;
					const shockVal = Math.min(Number(data.shock ?? 0) || 0, 2.5);

					if (temp > 30) {
						incoming.push(
							buildNotification({
								id: `temp-${truck}`,
								type: 'temperature',
									severity: 'critical',
								})
							);
						}

						if (humidity < 40) {
							incoming.push(
								buildNotification({
									id: `humidity-${truck}`,
									type: 'humidity',
									category: 'sensor',
									message: `Low humidity ${humidity}%`,
									value: `${humidity}%`,
									severity: 'warning',
								})
							);
						}

						if (shockVal > 2) {
							const shockStr = shockVal.toFixed ? shockVal.toFixed(2) : String(shockVal);
							incoming.push(
								buildNotification({
									id: `shock-${truck}`,
									type: 'shock',
									category: 'sensor',
									message: `High shock ${shockStr}G`,
									value: `${shockStr}G`,
									severity: 'critical',
								})
							);
						}
					});

					setAllNotifications((prev) => {
						const merged = [...incoming, ...prev];
						const unique = merged.filter((item, idx, arr) => idx === arr.findIndex((n) => n.id === item.id));
						return unique.slice(0, 40);
					});

					// Send email once per new notification (per recipient)
					const unsent = incoming.filter((n) => !sentEmailIds.has(n.id));
					if (unsent.length) {
						const nextSet = new Set(sentEmailIds);
						unsent.forEach((n) => {
							sendEmailAlert(n, recipientEmail);
							nextSet.add(n.id);
						});
						setSentEmailIds(nextSet);
						try {
							const key = `sent_email_ids_${recipientEmail || DEFAULT_EMAIL}`;
							localStorage.setItem(key, JSON.stringify(Array.from(nextSet)));
						} catch (e) {
							console.warn('Could not persist sent email ids', e);
						}
					}
				} catch (err) {
					console.warn('Snapshot processing failed:', err);
				}
			});
		} catch (err) {
			console.warn('Firestore subscription failed:', err);
		}

		return () => {
			try { unsubscribe(); } catch {}
		};
	}, [recipientEmail, sentEmailIds]);

	const filteredNotifications = useMemo(() => {
		if (!user) return [];
		if (user.role === 'farmer') return allNotifications; // Farmers see both sensor and fleet (connection) alerts
		if (user.role === 'driver' || user.role === 'transporter') return allNotifications.filter((n) => n.category === 'fleet');
		return allNotifications;
	}, [allNotifications, user]);

	const unreadCount = useMemo(
		() => filteredNotifications.filter((n) => !n.isRead).length,
		[filteredNotifications]
	);

	const markAsRead = (id) => setAllNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
	const markAllAsRead = () => setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
	const clearNotifications = () => setAllNotifications([]);
	const updateRecipientEmail = (email) => {
		setRecipientEmail(email);
		localStorage.setItem('alert_email_recipient', email);
	};

	return (
		<NotificationContext.Provider value={{ notifications: filteredNotifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, recipientEmail, updateRecipientEmail }}>
			{children}
		</NotificationContext.Provider>
	);
};
