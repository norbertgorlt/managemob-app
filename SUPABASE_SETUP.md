## Connexion a Supabase

1. Cree un fichier `.env.local` a la racine du projet.
2. Copie le contenu de `.env.example`.
3. Renseigne :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Le front utilise `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
Le script d import utilise `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.

## Base de donnees

1. Ouvre l editeur SQL de Supabase.
2. Execute [schema.sql](/c:/Users/norbe/Documents/GitHub/managemob-app/supabase/schema.sql).

## Import des donnees

Les CSV d origine se trouvent dans `datiAirtable/`.

Commande :

```bash
npm run import:supabase
```

## Demarrage

```bash
npm run dev
```

Si l application signale que Supabase n est pas configure, verifie le contenu de `.env.local`.
