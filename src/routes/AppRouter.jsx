import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import PublicLayout from '../components/layout/PublicLayout';

import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

import Home from '../pages/Landing/Home';
import Rooms from '../pages/Landing/Rooms';
import RoomDetail from '../pages/Landing/RoomDetail';
import About from '../pages/Landing/About';
import Contact from '../pages/Landing/Contact';

import NotFound from '../pages/NotFound';

import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
import VerifyOtp from '../pages/Auth/VerifyOtp';

import LayoutAdmin from '../layouts/LayoutAdmin/AppLayout';
import LayoutReception from '../layouts/LayoutLReception/AppLayout';
import LayoutClient from '../layouts/LayoutClient/AppLayout';

import AdminDashboard from '../pages/Admin/Dashboard';
import RoomIndex from '../pages/Admin/Room/Index';
import RoomCreate from '../pages/Admin/Room/Create';
import RoomEdit from '../pages/Admin/Room/Edit';
import RoomShow from '../pages/Admin/Room/Show';

import AdminAdministrateurList from '../pages/Admin/Administrateurs/AdminAdministrateurList';
import AdminAdministrateurForm from '../pages/Admin/Administrateurs/AdminAdministrateurForm';
import AdminAdministrateurShow from '../pages/Admin/Administrateurs/AdminAdministrateurShow';

import AdminReceptionnisteList from '../pages/Admin/Receptionnistes/AdminReceptionnisteList';
import AdminReceptionnisteForm from '../pages/Admin/Receptionnistes/AdminReceptionnisteForm';
import AdminReceptionnisteShow from '../pages/Admin/Receptionnistes/AdminReceptionnisteShow';

import AdminClientList from '../pages/Admin/Clients/AdminClientList';
import AdminClientForm from '../pages/Admin/Clients/AdminClientForm';
import AdminClientShow from '../pages/Admin/Clients/AdminClientShow';

import AdminReservationIndex from '../pages/Admin/Reservation/Index';
import AdminReservationCreate from '../pages/Admin/Reservation/Create';
import AdminReservationShow from '../pages/Admin/Reservation/Show';
import AdminReservationEdit from '../pages/Admin/Reservation/Edit';

import AdminRatingIndex from '../pages/Admin/Rating/Index';
import Administrators from '../pages/Admin/Administrators';

import ReceptionDashboard from '../pages/Reception/Dashboard';
import ClientDashboard from '../pages/Client/Dashboard';
import ReceptionReservations from '../pages/Reception/Reservations';
import ReceptionRooms from '../pages/Reception/Rooms';
import ReceptionClients from '../pages/Reception/Clients';
import ClientReservations from '../pages/Client/Reservations';
import ClientProfile from '../pages/Client/Profile';
import ClientRatings from '../pages/Client/Ratings';
import ClientRooms from '../pages/Client/Rooms';
import ClientRoomShow from '../pages/Client/RoomShow';
import ClientReservationCreate from '../pages/Client/ReservationCreate';
import ClientReservationShow from '../pages/Client/ReservationShow';

const AppRouter = () => {
    const location = useLocation();

    return (
        <Routes location={location} key={location.pathname}>
            
            {/* Public Routes with Shared Layout (accessible for all) */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id" element={<RoomDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Guest Only Routes (Login, etc.) */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                </Route>
            </Route>

            {/* Protected Client Routes */}
            <Route element={<PrivateRoute allowedRoles={['client', 'admin', 'receptionniste']} />}>
                <Route element={<LayoutClient />}>
                    <Route path="/client/dashboard"    element={<ClientDashboard />} />
                    <Route path="/client/rooms"        element={<ClientRooms />} />
                    <Route path="/client/rooms/:id"    element={<ClientRoomShow />} />
                    <Route path="/client/reservations" element={<ClientReservations />} />
                    <Route path="/client/reservations/create" element={<ClientReservationCreate />} />
                    <Route path="/client/reservations/:id" element={<ClientReservationShow />} />
                    <Route path="/client/profile"      element={<ClientProfile />} />
                    <Route path="/client/ratings"      element={<ClientRatings />} />
                </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route element={<LayoutAdmin />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />

                    <Route path="/admin/reservations" element={<AdminReservationIndex />} />
                    <Route path="/admin/reservations/create" element={<AdminReservationCreate />} />
                    <Route path="/admin/reservations/:id" element={<AdminReservationShow />} />
                    <Route path="/admin/reservations/:id/edit" element={<AdminReservationEdit />} />

                    <Route path="/admin/administrateurs" element={<AdminAdministrateurList />} />
                    <Route path="/admin/administrateurs/create" element={<AdminAdministrateurForm />} />
                    <Route path="/admin/administrateurs/:id" element={<AdminAdministrateurShow />} />
                    <Route path="/admin/administrateurs/:id/edit" element={<AdminAdministrateurForm />} />
                    
                    <Route path="/admin/receptionnistes" element={<AdminReceptionnisteList />} />
                    <Route path="/admin/receptionnistes/create" element={<AdminReceptionnisteForm />} />
                    <Route path="/admin/receptionnistes/:id" element={<AdminReceptionnisteShow />} />
                    <Route path="/admin/receptionnistes/:id/edit" element={<AdminReceptionnisteForm />} />
                    
                    <Route path="/admin/clients" element={<AdminClientList />} />
                    <Route path="/admin/clients/create" element={<AdminClientForm />} />
                    <Route path="/admin/clients/:id" element={<AdminClientShow />} />
                    <Route path="/admin/clients/:id/edit" element={<AdminClientForm />} />
                    
                    <Route path="/admin/rooms" element={<RoomIndex />} />
                    <Route path="/admin/rooms/create" element={<RoomCreate />} />
                    <Route path="/admin/rooms/:id" element={<RoomShow />} />
                    <Route path="/admin/rooms/:id/edit" element={<RoomEdit />} />

                    <Route path="/admin/ratings" element={<AdminRatingIndex />} />

                </Route>
            </Route>

            {/* Protected Receptionniste Routes */}
            <Route element={<PrivateRoute allowedRoles={['receptionniste', 'admin']} />}>
                <Route element={<LayoutReception />}>
                    <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
                    <Route path="/reception/reservations" element={<ReceptionReservations />} />
                    <Route path="/reception/rooms" element={<ReceptionRooms />} />
                    <Route path="/reception/clients" element={<ReceptionClients />} />
                </Route>
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;
