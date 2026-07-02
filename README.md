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


## Version 5 — Interface chauffeur réorganisée

La page chauffeur a été réorganisée en mode poste de départ :
- colonne gauche : choisir le bus, état du trajet, caisse, paiement cash station ;
- colonne droite : action chauffeur, liste des passagers, journal ;
- disposition plus proche d’un tableau de bord chauffeur pour tablette/ordinateur.


## Version 6 — Info passagers dans Dispatch

Ajout dans la vue Dispatch :
- bouton "Info passagers" sur chaque carte bus ;
- ouverture d’une fenêtre de détail ;
- résumé par point de montée ;
- destination finale du bus ;
- nombre de places par point de montée ;
- montant encaissé par point de montée ;
- liste détaillée des passagers comme côté chauffeur.


## Version 7 — Statuts de montée passagers

Ajouts :
- statut passager : En attente, Monté et payé, Monté et scanné, Absent ;
- boutons côté chauffeur pour confirmer une montée, scanner ou marquer absent ;
- bouton "Confirmer tous les passagers de cet arrêt" ;
- au moment du départ d’un arrêt, les passagers encore en attente à cet arrêt passent automatiquement en "Absent" ;
- le dispatch voit aussi les statuts dans "Info passagers".


## Version 8 — Correction logique terrain

Corrections :
- suppression de "En attente" et "Monté et scanné" ;
- seuls statuts passagers conservés : "Absent" et "Monté et payé" ;
- une réservation est "Absent" par défaut tant que le chauffeur ne confirme pas la montée ;
- si le bus part, les passagers non confirmés restent "Absent" ;
- paiement cash bloqué lorsque le bus est en route ou la course terminée ;
- paiement cash autorisé seulement au point de montée actif.

## Version 9 — Mobile chauffeur + point actif

Corrections :
- interface chauffeur plus légère sur téléphone grâce aux accordéons ;
- paiement cash station en accordéon ;
- liste passagers en accordéon ;
- journal en accordéon ;
- les boutons passagers Monté/payé sont bloqués si le passager n’est pas au point de montée actif ;
- exemple : tant que le bus est à Owendo, les passagers de La Poste ne peuvent pas être confirmés.


## Version 10 — Actions propres + heures réelles

Corrections :
- la colonne Action n’affiche plus deux boutons concurrents ;
- elle utilise maintenant un choix déroulant : Monté/payé ou Absent ;
- le bouton global de confirmation est désactivé lorsqu’il n’y a plus de point de montée actif ;
- la frise affiche les heures prévues et les heures réelles : départ réel, arrivée réelle, etc.


## Version 11 — Incident / Retard intégré

Ajouts :
- accordéon Incident / Retard dans l’interface chauffeur ;
- type d’incident : Retard/trafic, Accident, Contrôle de police, Panne, Vandalisme/trouble, Autre ;
- estimation : 15 min, 30 min, 45 min, 1 heure ;
- retard cumulable ;
- calcul des passagers à prévenir selon les points de montée non encore dépassés ;
- affichage du retard dans Dispatch ;
- détail des incidents dans Info passagers.
