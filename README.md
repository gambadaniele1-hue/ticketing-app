# 🎫 Ticketing App
### Frontend SPA — React + Tailwind CSS

> Interfaccia utente del sistema di ticketing multi-tenant ibrido. 
> Progettata con Claude Design e integrata con ticketing-api via REST.

---

## 📌 Panoramica

**Ticketing App** è il frontend del sistema. Gestisce la registrazione 
dei tenant, il login, e l'interfaccia operativa per la gestione dei ticket. 
Ogni tenant accede tramite il proprio sottodominio dedicato.

---

## 🛠️ Stack

| Componente | Versione |
|---|---|
| React | 19 |
| Tailwind CSS | v4 |
| Vite | — |

---

## ⚙️ Installazione
VITE_API_URL=http://localhost:8000

```bash
git clone https://github.com/gambadaniele1-hue/ticketing-app.git
cd ticketing-app
npm install
cp .env.example .env
npm run dev
```

Configura `.env`:
VITE_API_URL=http://localhost:8000

---

## 📦 Repository collegate

| Repository | Descrizione |
|---|---|
| [`ticketing-api`](https://github.com/gambadaniele1-hue/ticketing-api) | Backend REST Laravel 12 |
| [`ticketing-mail`](https://github.com/gambadaniele1-hue/ticketing-mail) | Microservizio Go per email |
| [`ticketing-docs`](https://github.com/gambadaniele1-hue/ticketing-docs) | Documentazione completa |

---

## 👤 Autore

Progetto realizzato come elaborato di quinta superiore — Informatica.

---

*Frontend v1.0 — React 19 + Tailwind CSS*
