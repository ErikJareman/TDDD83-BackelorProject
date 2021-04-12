Såhär "hostar" du hemsidan så att andra kan se den.

1. Skapa ett konto på [ngrok](https://dashboard.ngrok.com/)
2. Ladda ner ngrok så att du får en `ngrok` fil som du lägger i denna mapp.
3. Kör `/ngrok authtoken <ER API NYCKEL>` Ersätt <ER API NYCKEL> med nyckeln från [ngroks hemsida](https://dashboard.ngrok.com/get-started/setup)
4. Gå in i clienten och ändra i [src/shared/env.ts](client/src/shared/env.ts) så att `production = true`. Ändra tillbaka detta sen om du ska gå tillbaka till att utveckla som vanligt.
5. Kör `npm run build` i client mappen.
6. Starta python servern.
7. Kör `./ngrok http http://127.0.0.1:5000/`
