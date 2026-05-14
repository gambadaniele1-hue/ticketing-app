# 🎫 Ticketing App
### Frontend — React + Vite + Tailwind

> Interfaccia utente del sistema di ticketing multi-tenant ibrido. Comunica con il backend Laravel tramite API REST e gestisce i flussi di autenticazione, registrazione tenant e pannelli per ogni ruolo.

---

## 📌 Panoramica

**Ticketing App** è il frontend della piattaforma. Gestisce due domini distinti:

- **Dominio centrale** (`localhost`) — landing page, registrazione tenant, flusso OTP per trovare il proprio spazio di lavoro.
- **Dominio tenant** (`{subdomain}.localhost`) — login, pannello Admin, pannello Agente, portale Cliente.

---

## 🛠️ Stack

| Componente | Versione |
|---|---|
| React | 18+ |
| Vite | — |
| Tailwind CSS | — |

---

## ⚙️ Installazione

```bash
# 1. Clona la repository
git clone https://github.com/gambadaniele1-hue/ticketing-app.git
cd ticketing-app

# 2. Installa le dipendenze
npm install

# 3. Copia il file di configurazione
cp .env.example .env

# 4. Avvia il server di sviluppo
npm run dev
```

---

## 🌐 Struttura URL

| Dominio | Scopo |
|---|---|
| `localhost` | Landing page, registrazione tenant, flusso OTP |
| `{subdomain}.localhost` | Login, dashboard per ruolo |

---

## 📄 Pagine

### Dominio Centrale
- **Landing page** — Hero, Come funziona, Piani, Footer
- **Modal Registrazione Tenant** — wizard 2 step (selezione piano → form)
- **Modal Trova Workspace** — wizard 4 step (email → OTP → lista tenant → redirect)

### Dominio Tenant
- **Login** — scheda tenant + form login
- **Pending** — accesso in attesa di approvazione
- **Not Found** — sottodominio non esistente

### Pannello Admin *(UI con dati mock — backend in sviluppo)*
- Dashboard statistiche
- Gestione utenti (approva, rifiuta, sospendi, riattiva, cambia ruolo)
- Gestione team e membri
- Gestione categorie
- Gestione SLA
- Visualizzazione macro

### Pannello Agente *(UI dimostrativa)*
- Coda ticket del team
- Dettaglio ticket con chat e note interne

### Portale Cliente *(UI dimostrativa)*
- Lista ticket personali
- Apertura nuovo ticket
- Dettaglio ticket

---

## 🔐 Autenticazione

I token JWT viaggiano in **cookie HttpOnly** gestiti dal backend — il frontend non li vede mai direttamente. Tutte le chiamate API usano `credentials: 'include'` per trasportare i cookie automaticamente.

Dopo il login il redirect avviene in base al ruolo:

| Ruolo | Redirect |
|---|---|
| `Admin` | `/admin/dashboard` |
| `Agent` | `/agent/dashboard` |
| `Team Lead` | `/agent/dashboard` |
| `Customer` | `/customer/dashboard` |

---

## 🔧 Variabili d'ambiente

```env
VITE_API_BASE_URL=http://localhost
VITE_APP_DOMAIN=localhost
```

---

## 📦 Repository collegate

| Repository | Descrizione |
|---|---|
| [`ticketing-api`](https://github.com/gambadaniele1-hue/ticketing-api) | Backend Laravel — API REST |
| [`ticketing-mail`](https://github.com/gambadaniele1-hue/ticketing-mail) | Microservizio Go per l'invio email via Redis |
| [`ticketing-docs`](https://github.com/gambadaniele1-hue/ticketing-docs) | Documentazione completa |

---

## 👤 Autore

Progetto realizzato come elaborato di quinta superiore — Informatica.

---

*App v1.0 — React + Vite + Tailwind*
