import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { User, Truck, Sprout, Building2, Lock, LogIn, Mail } from 'lucide-react';
import { useUser } from '../UserContext';
import { translations } from '../translations';

const Login = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const outlet = useOutletContext();
	const { login } = useUser();

	const [lang] = useState(location.state?.lang || outlet?.lang || 'en');
	const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
	const [selectedRole, setSelectedRole] = useState(location.state?.role || null);
	const [name, setName] = useState('Demo User');
	const [email, setEmail] = useState('demo@harvest.link');
	const [password, setPassword] = useState('demo123');
	const [errors, setErrors] = useState({});

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const t = translations.login?.[lang] || translations.login?.en || {
		selectRole: 'Select Your Role',
		name: 'Name',
		email: 'Email Address',
		password: 'Password',
		login: 'Login',
		admin: 'Admin',
		farmer: 'Farmer',
		driver: 'Driver',
		transporter: 'Transporter',
		error: 'Please fill all fields',
		invalidRole: 'Please select a role'
	};

	const roles = [
		{ id: 'admin', label: t.admin || 'Admin', icon: <Building2 size={24} /> },
		{ id: 'farmer', label: t.farmer || 'Farmer', icon: <Sprout size={24} /> },
		{ id: 'driver', label: t.driver || 'Driver', icon: <Truck size={24} /> },
		{ id: 'transporter', label: t.transporter || 'Transporter', icon: <Truck size={24} /> }
	];

	const validateForm = () => {
		const newErrors = {};
		if (!selectedRole) newErrors.role = t.invalidRole || 'Please select a role';
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleLogin = () => {
		if (!validateForm()) return;

		login({ name: name || 'Demo User', email: email || 'demo@harvest.link', role: selectedRole, lang, loginTime: new Date() });

		const roleRoutes = {
			admin: '/dashboard',
			farmer: '/farmer',
			driver: '/driver',
			transporter: '/fleet-standalone'
		};
		navigate(roleRoutes[selectedRole]);
	};

	return (
		<div style={{
			minHeight: '100vh',
			width: '100%',
			background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/images/landing-bg.jpg")',
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '15px',
			fontFamily: 'Inter, sans-serif'
		}}>
			<div style={{
				background: 'white',
				borderRadius: '16px',
				boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
				padding: isMobile ? '20px' : '40px',
				maxWidth: isMobile ? '90%' : '500px',
				width: '100%'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
					<Truck size={26} color="#2d5a27" />
					<h1 style={{ color: 'var(--primary-green)', margin: 0, fontSize: isMobile ? '22px' : '26px', letterSpacing: '0.5px' }}>HARVEST<span style={{ fontWeight: '300', opacity: 0.8 }}>LINK</span></h1>
				</div>
				<p style={{ color: '#555', margin: '0 0 25px 0', fontSize: isMobile ? '12px' : '14px', textAlign: 'center' }}>Unified Logistics Interface (UBL)</p>

				<div style={{ marginBottom: '30px' }}>
					<label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '12px' }}>
						{t.selectRole || 'Select Your Role'}
					</label>
					<div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', gap: '10px' }}>
						{roles.map((role) => (
							<div
								key={role.id}
								onClick={() => { setSelectedRole(role.id); setErrors({ ...errors, role: '' }); }}
								style={{
									padding: '12px',
									border: selectedRole === role.id ? '3px solid #a5d6a7' : '2px solid #ddd',
									borderRadius: '10px',
									background: selectedRole === role.id ? 'rgba(165,214,167,0.15)' : '#f9f9f9',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									transition: 'all 0.2s',
									fontSize: isMobile ? '12px' : '13px'
								}}
							>
								<div style={{ color: 'var(--primary-green)' }}>{role.icon}</div>
								<span style={{ color: selectedRole === role.id ? 'var(--primary-green)' : '#333', fontWeight: '600' }}>{role.label}</span>
							</div>
						))}
					</div>
					{errors.role && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '8px' }}>{errors.role}</div>}
				</div>

				{selectedRole && (
					<div>
						<Field
							label={t.name || 'Name'}
							value={name}
							onChange={(v) => setName(v)}
							icon={<User size={18} color="var(--primary-green)" />}
							type="text"
						/>
						<Field
							label={t.email || 'Email Address'}
							value={email}
							onChange={(v) => setEmail(v)}
							icon={<Mail size={18} color="var(--primary-green)" />}
							type="email"
						/>
						<Field
							label={t.password || 'Password'}
							value={password}
							onChange={(v) => setPassword(v)}
							icon={<Lock size={18} color="var(--primary-green)" />}
							type="password"
						/>

						<button
							onClick={handleLogin}
							style={{
								width: '100%',
								padding: '12px',
								background: 'var(--primary-green)',
								color: 'white',
								border: 'none',
								borderRadius: '8px',
								fontSize: '14px',
								fontWeight: 'bold',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '8px',
								transition: 'background 0.2s',
								marginTop: '10px'
							}}
							onMouseOver={(e) => e.currentTarget.style.background = '#1e3b1a'}
							onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-green)'}
						>
							<LogIn size={18} />
							{t.login || 'Login'}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

const Field = ({ label, value, onChange, icon, type, error }) => (
	<div style={{ marginBottom: '15px' }}>
		<label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '6px' }}>{label}</label>
		<div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '10px 12px', borderRadius: '8px', border: error ? '2px solid #d32f2f' : '1px solid #ddd' }}>
			{icon}
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', outline: 'none' }}
			/>
		</div>
		{error && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
	</div>
);

export default Login;
