
Obiettivo: sistemare l’accesso admin e rendere chiaro/funzionante l’accesso alla galleria.

Cosa ho verificato
- Il login admin non è bloccato a livello account: nei log c’è un accesso riuscito.
- Il problema principale è lato frontend: alcune pagine admin fanno il redirect troppo presto.
- `AdminGallery.tsx` e `AdminNew.tsx` controllano solo `loading`, ma non aspettano `isAdminLoading`.
- `AdminSecurity.tsx` è ancora più fragile: controlla `session` e `isAdmin` senza aspettare il completamento del controllo ruolo.
- `/gallery` oggi non esiste come route. La galleria pubblica è solo una sezione della home (`id="galleria"`), quindi l’URL `francescocitino.it/gallery` va correttamente in 404 con il codice attuale.
- L’accesso admin alla galleria esiste già su `/admin/gallery`.

Piano di implementazione
1. Uniformare i controlli admin
- Aggiornare `AdminGallery`, `AdminNew` e `AdminSecurity` per usare lo stesso pattern già corretto di `AdminPanel` / `AdminBlog`.
- Attendere sempre `loading || isAdminLoading` prima di mostrare toast o fare redirect.
- Evitare il falso “Accesso negato” per utenti che sono davvero admin.

2. Migliorare il flusso di login
- In `AuthPage.tsx`, dopo login riuscito, reindirizzare a `/admin/panel` invece di `/admin`, così l’ingresso admin è più chiaro.
- Se apro direttamente `/admin/gallery` da non autenticato, mantenere il ritorno alla pagina richiesta dopo il login.

3. Sistemare la galleria pubblica
- Aggiungere una route pubblica `/gallery`.
- Soluzione consigliata: far aprire la galleria pubblica senza 404, riusando il componente `Gallery` oppure reindirizzando/scorrendo automaticamente alla sezione `galleria` della home.

4. Verifica finale
- Test login admin completo.
- Test apertura `/admin/panel`.
- Test click su “Galleria Foto” dal pannello admin.
- Test apertura diretta `/admin/gallery`.
- Test URL pubblico `/gallery` sul dominio pubblicato, senza 404.

Come si accede oggi
- Galleria admin: `/admin/gallery` dopo login da `/auth`.
- Galleria pubblica: dalla home, cliccando “Galleria” nel menu.
- `/gallery` al momento non è supportato come pagina separata.

Dettagli tecnici
- File da aggiornare: `src/pages/AdminGallery.tsx`, `src/pages/AdminNew.tsx`, `src/pages/AdminSecurity.tsx`, `src/pages/AuthPage.tsx`, `src/App.tsx`.
- Pattern corretto da copiare: `src/pages/AdminPanel.tsx` e `src/pages/AdminBlog.tsx`.
- Nessuna modifica backend necessaria: è un problema di routing e timing del controllo ruolo nel client.
