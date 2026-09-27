/** Badge de statut coloré */
const configs = {
  brouillon: { label: 'Brouillon',   cls: 'badge-brouillon' },
  en_cours:  { label: 'En cours',    cls: 'badge-en_cours'  },
  soumise:   { label: 'Soumise',     cls: 'badge-soumise'   },
  archivee:  { label: 'Archivée',    cls: 'badge-archivee'  },
  planifiee: { label: 'Planifiée',   cls: 'badge-planifiee' },
  terminee:  { label: 'Terminée',    cls: 'badge-terminee'  },
  annulee:   { label: 'Annulée',     cls: 'badge-annulee'   },
  vert:      { label: 'Conforme',    cls: 'badge-vert'      },
  orange:    { label: 'Surveillance',cls: 'badge-orange'    },
  rouge:     { label: 'Hors service',cls: 'badge-rouge'     },
  admin:     { label: 'Admin',       cls: 'badge-soumise'   },
  inspecteur:{ label: 'Inspecteur',  cls: 'badge-en_cours'  },
};

export default function Badge({ status, label, className = '' }) {
  const cfg = configs[status] || { label: status || '—', cls: 'badge-brouillon' };
  return (
    <span className={`badge ${cfg.cls} ${className}`}>
      {label || cfg.label}
    </span>
  );
}
