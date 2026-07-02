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



## Version 2

Amélioration du dispatch :
- affiche "En route vers La Poste", "En route vers Centre-ville", etc.
- affiche "À l’arrêt : La Poste — embarquement"
- affiche le statut de remplissage : Vide, Places en cours, Complet
- ajoute des couleurs selon le statut du bus et des places.


## Version 3

Amélioration de la frise de trajet :
- la ligne se colore selon l’avancement ;
- le point de destination en cours devient jaune ;
- un message indique clairement : en attente, en route vers..., à l’arrêt..., ou arrivé au terminus.


## Version 4 — Paiement et tarifs 60 FCFA/km

Ajouts :
- prix par place côté client ;
- total à payer selon le nombre de places ;
- réservation marquée comme payée dans la démo ;
- paiement cash côté chauffeur pour les passagers sans réservation ;
- caisse du bus côté chauffeur ;
- total encaissé côté dispatch.

Règles :
- tarif = distance retenue en km × 60 FCFA ;
- distance retenue en km entier : 15,49 → 15 km ; 15,50 → 16 km ;
- minimum commercial : 300 FCFA ;
- arrondi du montant au 50 FCFA supérieur.

Tarifs de démonstration intégrés :
- Bus 1 : Owendo 1 000 FCFA, La Poste 300 FCFA.
- Bus 2 : Centre-ville 1 000 FCFA, La Poste 900 FCFA.
- Bus 3 : Owendo 1 350 FCFA, Nzeng-Ayong 600 FCFA, PK5 450 FCFA.
- Bus 4 : PK12 1 350 FCFA, PK5 900 FCFA, Nzeng-Ayong 750 FCFA.
- Bus 5 : Akanda 1 900 FCFA, Alibandeng 550 FCFA, La Poste 300 FCFA.
- Bus 6 : Centre-ville 1 900 FCFA, La Poste 1 800 FCFA, Alibandeng 1 350 FCFA.
