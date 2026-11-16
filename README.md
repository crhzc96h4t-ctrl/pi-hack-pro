# PI-HACK PRO — iPhone PWA

Een installeerbare website voor iPhone. Geen Raspberry Pi, Xcode of App Store nodig voor de frontend.

## Wat werkt
- Installeerbare PWA met offline cache voor de interface.
- Dashboard en navigatie.
- DNS lookup via Cloudflare DNS-over-HTTPS.
- Sterke wachtwoordgenerator met Web Crypto.
- TV-aan/uit en media-bediening via Home Assistant REST API (mits Home Assistant HTTPS bereikbaar is, CORS correct is ingesteld en de tv-integratie de service ondersteunt).
- Opslag van configuratie lokaal in de browser.

## Eerlijke browserbeperkingen
Safari op iOS laat een PWA niet:
- alle zichtbare Wi-Fi-netwerken/BSSID's scannen;
- algemene IP-range scans of Nmap uitvoeren;
- Wi-Fi monitor mode of packet injection gebruiken;
- willekeurige netwerkpakketten sniffen;
- zelf IR-signalen uitzenden.
Web Bluetooth wordt niet ondersteund in iOS Safari zoals op Android/desktop Chrome. De app toont daarom geen nepresultaten voor deze functies.

## TV bedienen
De PWA gebruikt Home Assistant als beveiligde brug. Voeg je TV toe aan Home Assistant (bijvoorbeeld via de passende Samsung Smart TV, LG webOS, Android TV/Google TV, Roku of andere integratie). Maak in Home Assistant een Long-Lived Access Token aan voor een gebruiker met beperkte rechten.

1. Publiceer Home Assistant via HTTPS met een geldig certificaat, bijvoorbeeld via een beveiligde remote-access-oplossing.
2. Open de PWA op je iPhone.
3. Ga naar Instellingen en vul je Home Assistant HTTPS-URL en token in.
4. Ga naar TV Remote en vul het entity ID in, bijvoorbeeld `media_player.woonkamer_tv`.
5. Test de verbinding en gebruik de knoppen.

**CORS:** Home Assistant moet browserverzoeken van de GitHub Pages-origin toestaan. Configureer `cors_allowed_origins` in `configuration.yaml` met je exacte GitHub Pages-origin, bijvoorbeeld `https://JOUW-GITHUB-NAAM.github.io`. Herstart Home Assistant. Zet CORS niet open voor `*`.
Voorbeeld:
```yaml
http:
  cors_allowed_origins:
    - https://JOUW-GITHUB-NAAM.github.io
```
Controleer eerst of je bestaande `http:`-configuratie al bestaat; voeg geen tweede `http:`-blok toe. Het toegangstoken wordt in localStorage bewaard. Gebruik bij voorkeur een apart Home Assistant-account met minimale rechten en verwijder het token na gebruik als je de telefoon verliest.

De power-knop roept `media_player.turn_on` of `media_player.turn_off` aan. Dit werkt alleen als de integratie en tv dit ondersteunen. Sommige tv's kunnen via netwerk wel uit maar niet aan, tenzij Wake-on-LAN of netwerkstand-by aan staat.

## Infrarood
Een iPhone heeft geen IR-zender. Voor IR heb je een externe Wi-Fi-naar-IR-bridge nodig die met Home Assistant integreert (bijvoorbeeld een ondersteunde Broadlink-bridge). Voeg die bridge en de tv-afstandsbediening toe in Home Assistant. Daarna kunnen passende Home Assistant scripts of knoppen worden toegevoegd aan de PWA. Deze basisversie stuurt geen universele IR-code rechtstreeks.

## Publiceren op GitHub Pages
1. Maak of log in op GitHub.
2. Maak een nieuwe **public repository**, bijvoorbeeld `pi-hack-pro`.
3. Upload alle bestanden en mappen uit deze projectmap naar de hoofdmap van de repository. Houd `index.html` in de root.
4. Open **Settings → Pages**.
5. Kies **Deploy from a branch**, branch `main`, folder `/ (root)`, klik Save.
6. Wacht tot GitHub Pages de URL toont, doorgaans `https://JOUW-GITHUB-NAAM.github.io/pi-hack-pro/`.
7. Open die URL in Safari op je iPhone.
8. Tik op Deel → **Zet op beginscherm** → Voeg toe.

De PWA vereist HTTPS; GitHub Pages levert HTTPS.

## Bestanden
- `index.html` — interface
- `styles.css` — styling
- `app.js` — functionaliteit
- `manifest.webmanifest` — PWA metadata
- `sw.js` — offline cache
- `icons/` — app-iconen

## Privacy
De Home Assistant-URL, token en entity ID worden opgeslagen in localStorage op het apparaat. DNS-query's gaan naar Cloudflare DNS-over-HTTPS. Er is geen eigen backend of analytics in deze projectbasis. Behandel het token als een wachtwoord.
