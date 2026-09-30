import React, { useState } from 'react';
import { CalendarDays, Loader2, Plus, X, BedDouble } from 'lucide-react';
import { useReceptionClients } from '../../hooks/useReceptionClients';
import { useReceptionReservations } from '../../hooks/useReceptionReservations';
import { useReceptionRooms } from '../../hooks/useReceptionRooms';
import { ReservationModel, ReservationStatus } from '../../models/ReservationModel';
import { getImageUrl } from '../../utils/getImageUrl';

const statuses = ['all', ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED, ReservationStatus.COMPLETED];
const today = new Date().toISOString().slice(0, 10);
const emptyForm = { client_id: '', room_id: '', reservation_date: today, end_date: today, start_time: '12:00', end_time: '12:00', total_price: '', notes: '' };

export default function ReceptionReservations() {
    const [status, setStatus] = useState('all');
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const { reservations, loading, error, createReservation, updateStatus } = useReceptionReservations(status);
    const { clients } = useReceptionClients();
    const { rooms } = useReceptionRooms({ per_page: 100, status: 'available' });

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await createReservation(form);
            setForm(emptyForm);
            setShowForm(false);
            setMessage('Réservation créée avec succès.');
        } catch (requestError) {
            setMessage(requestError.response?.data?.message || 'La création a échoué.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-semibold text-amber-600">Opérations</p>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Réservations</h1>
                    <p className="mt-1 text-sm text-slate-500">Créez, confirmez et suivez les séjours.</p>
                </div>
                <button
                    onClick={() => setShowForm((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white"
                >
                    {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showForm ? 'Fermer' : 'Nouvelle réservation'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 md:grid-cols-2">
                    <select
                        required
                        value={form.client_id}
                        onChange={(event) => setForm({ ...form, client_id: event.target.value })}
                        className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm"
                    >
                        <option value="">Choisir un client</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.prenom} {client.nom}
                            </option>
                        ))}
                    </select>

                    <select
                        required
                        value={form.room_id}
                        onChange={(event) => setForm({ ...form, room_id: event.target.value })}
                        className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm"
                    >
                        <option value="">Choisir une chambre libre</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            required
                            type="date"
                            min={today}
                            value={form.reservation_date}
                            onChange={(event) => setForm({ ...form, reservation_date: event.target.value })}
                            className="flex-1 rounded-xl border-0 bg-white px-3 py-2.5 text-sm"
                        />
                        <input
                            required
                            type="time"
                            value={form.start_time}
                            onChange={(event) => setForm({ ...form, start_time: event.target.value })}
                            className="flex-1 rounded-xl border-0 bg-white px-3 py-2.5 text-sm"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            required
                            type="date"
                            min={form.reservation_date}
                            value={form.end_date}
                            onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                            className="flex-1 rounded-xl border-0 bg-white px-3 py-2.5 text-sm"
                        />
                        <input
                            required
                            type="time"
                            value={form.end_time}
                            onChange={(event) => setForm({ ...form, end_time: event.target.value })}
                            className="flex-1 rounded-xl border-0 bg-white px-3 py-2.5 text-sm"
                        />
                    </div>

                    <input
                        required
                        type="number"
                        min="0"
                        placeholder="Montant total"
                        value={form.total_price}
                        onChange={(event) => setForm({ ...form, total_price: event.target.value })}
                        className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm"
                    />

                    <textarea
                        placeholder="Notes"
                        value={form.notes}
                        onChange={(event) => setForm({ ...form, notes: event.target.value })}
                        className="rounded-xl border-0 bg-white px-3 py-2.5 text-sm md:col-span-2"
                    />

                    <button
                        disabled={saving}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white md:col-span-2"
                    >
                        {saving ? 'Création...' : 'Créer la réservation'}
                    </button>
                </form>
            )}

            {message && <div className="rounded-xl bg-emerald-50 p-4 text-emerald-700">{message}</div>}
            {error && <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

            <div className="flex justify-end">
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-slate-900"
                >
                    {statuses.map((value) => (
                        <option key={value} value={value}>
                            {value === 'all' ? 'Tous les statuts' : ReservationModel.getStatusLabel(value)}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
                            <tr>
                                <th className="px-5 py-4 font-bold tracking-wider">Client</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Chambre</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Période</th>
                                <th className="px-5 py-4 font-bold tracking-wider">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {reservations.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.client?.profil ? (
                                                <img src={getImageUrl(item.client.profil)} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0 font-bold text-xs">
                                                    {item.client?.prenom?.[0]}{item.client?.nom?.[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{item.client?.prenom} {item.client?.nom}</p>
                                                <p className="text-xs text-slate-500">{item.client?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.room?.primary_image?.image_path ? (
                                                <img src={getImageUrl(item.room.primary_image.image_path)} alt="Chambre" className="w-12 h-8 rounded-lg object-cover shrink-0" />
                                            ) : (
                                                <div className="w-12 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    <BedDouble className="w-4 h-4 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="max-w-[200px]">
                                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.room?.name}</p>
                                                {item.room?.description_fr && (
                                                    <p className="text-[10px] text-slate-500 truncate" title={item.room.description_fr}>
                                                        {item.room.description_fr}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                Du {new Date(item.reservation_date).toLocaleDateString('fr-FR')} à {item.start_time?.slice(0, 5)}
                                            </p>
                                            <p className="text-[11px]">
                                                Au {new Date(item.end_date || item.reservation_date).toLocaleDateString('fr-FR')} à {item.end_time?.slice(0, 5)}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <select
                                            value={item.status}
                                            onChange={(event) => updateStatus(item.id, event.target.value)}
                                            className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer ${ReservationModel.getStatusColor(item.status)}`}
                                        >
                                            {statuses.slice(1).map((value) => (
                                                <option key={value} value={value}>
                                                    {ReservationModel.getStatusLabel(value)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {!reservations.length && (
                                <tr>
                                    <td colSpan="4" className="px-5 py-12 text-center text-slate-500">
                                        <CalendarDays className="mx-auto mb-2 h-8 w-8 opacity-30" />
                                        Aucune réservation.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
