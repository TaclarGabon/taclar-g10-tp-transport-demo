# G10 TP Transport — Démo GitHub Pages

Cette démo contient 3 interfaces :

- `client.html` : interface client pour réserver une place.
- `chauffeur.html` : interface chauffeur pour voir les passagers et avancer la course.
- `dispatch.html` : interface dispatch pour suivre les 6 bus et réinitialiser la démo.

## Important

Cette version utilise `localStorage`.

Cela veut dire :
- elle fonctionne bien pour une démo sur le même navigateur ;
- elle peut fonctionner sur GitHub Pages pour tester la logique ;
- elle n'est pas encore une vraie base de données partagée entre plusieurs téléphones.

Pour une vraie application, il faudra remplacer `localStorage` par Firebase.

## Déploiement GitHub Pages

1. Créer un nouveau repository GitHub.
2. Envoyer tous les fichiers de ce dossier.
3. Aller dans Settings > Pages.
4. Choisir la branche `main` et le dossier `/root`.
5. Ouvrir l'URL GitHub Pages générée.

