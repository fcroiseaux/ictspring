# ICT Spring App README

## Requirements

- Mac OS X 10.8+
- [brew](http://brew.sh/)
- [npm](https://www.npmjs.org/) (`brew install node`)

## Setup

1. Installer PhoneGap @ http://phonegap.com/install/
2. Installer la stack iOS: Xcode + Developer Tools
3. Installer la stack Android: ADT (eclipse + Android SDK)
4. Installer Ant (`brew install ant`)

## iOS

N'importe où:

    npm install ios-deploy -g
    npm install ios-sim -g

Dans le répertoire `ictspring`:

    phonegap build ios
    phonegap run ios

Pour nettoyer les fichiers en cas d'incohérence
supprimer le dossier build dans le projet iOS.

## Android

Phonegap build message:
> No project name specified, using Activity name 'ictspring'.
> If you wish to change it, edit the first line of build.xml.

Debug CLI: `adb logcat | grep "I/Web Console"`

    phonegap build android
    phonegap run android

Pour nettoyer les fichiers en cas d'incohérence
supprimer les dossiers ant-bin et ant-gen dans le projet Android.

## Development Workflow

### Général

Les modifications spécifiques à l'application se font dans le dossier `www`.
Après modification, `phonegap build <platform>` copie les fichiers dans le projet
de la platform correspondante, build le projet et le lance sur device ou simulateur.

Il est parfois nécessaire pour certains fichiers d'aller modifier directement le projet
dans le dossier `platforms/<platform>`.
C'est le cas pour les fichiers de resources (icons, splash etc), mais aussi
pour les fichiers de plugin sur iOS qui ne semblent pas s'ajouter correctement au projet.
Ces fichiers se trouvent dans `plugins/<plugin>/src/<platform>`.

La prise en compte du fichier `config.xml` dans le répertoire `www` semble aussi beaucoup
plus efficace pour la plate-forme `android` que pour la plate-forme `ios`.
L'ajout de plugin modifie bien les permissions dans le fichier `AndroidManifest.xml` sur Android.
Alors que les préférences telles que `webviewbounce` censée empécher la UIWebView iOS de scroller avec
le contenu de la page ne fonctionne pas. Cela a été fait à la main dans le projet iOS.

### Environnement

Conseil éditeur de texte: [Sublime Text](http://www.sublimetext.com/) ou [Atom](https://atom.io/)
pour la modification des fichiers HTML/CSS/JS.
Xcode pour iOS, ADT pour Android.

### Sass ([Website](http://sass-lang.com/))

Sass est un pre-processeur CSS qui permet notamment
l'utilisation de variable dans la feuille de style,
l'imbrication des styles
et la modularisation des feuilles de styles.

#### Installation

`sudo gem install sass`

#### Sass en ligne de commande:
`scss --watch www/css/style.scss:www/css/style.css`

#### Application

Le fichier style.scss importe les 4 éléments principaux :
-   `common` qui correspond au fichier `_common.scss`
    - Regroupe le chargement des fonts, les variables et les styles principaux.
- `layout` qui correspond au fichier `_layout.scss`
    - Regroupe les styles qui définissent le layout de l'application.
- `components` qui correspond au fichier `_component.scss`
    - Regroupe les styles qui définissent les composants de l'application tels que le menu, les cellules etc.
- `pages`qui correspond au fichier `_pages.scss`
    - Regroupe les styles des différentes pages de l'application. Chacune d'elle étant dans son propre fichier.

### RequireJS ([Website](http://requirejs.org/))

RequireJS est une librairie permettant de modulariser le code Javascript sous forme de composants.
La librairie charge les composants en tenant compte des dépendances de chacun définies en début de fichier.

#### Installation

Rien à installer. RequireJS s'utilise généralement avec r.js pour minifier et obfusquer le code.
Mais comme il s'agit d'une Web app, les fichiers étant en local, il n'y a pas besoin de les minifier.  

#### Application

Le fichier main.js charge les librairies telles que jQuery,
ainsi que les modules propres à l'application.

La fonction `require` prend en paramètre un tableau de dépendances
et une fonction de callback qui sera appelée lorsque toutes les dépendances seront chargées.
La fonction de callback reçoit en paramètre les dépendances chargées.

Chaque module utilise la fonction `define` pour définir ses propres dépendances
La fonction `define` appelle également une fonction de callback une fois les dépendances chargées.

### JSHint

Un fichier .jshintrc est fourni dans le répertoire `www`.
`npm install jshint -g`  
JSHint analyse le code Javascript et relève les problèmes potentiels.  
J'avais configuré [Sublime Text](http://www.sublimetext.com/) pour lancer jshint
à chaque sauvegarde de fichier.

## Fonctionnement

### index.html

Le fichier index.html est la base de l'application.
Il contient le layout de l'application et les éléments principaux
tels que le menu, le message de chargement, le message de perte de connexion etc.

Le fichier index.html charge phonegap.js et require.js.
Une fois chargé require.js charge le fichier spécifié dans l'attribut data-main.

### main.js

Le fichier main.js charge les librairies requises pour le bon fonctionnement de l'application.
- jQuery: pour la manipulation du DOM, les animations et les appels AJAX.
- Leaflet: pour la manipulation de la map.
- moment: pour la manipulation des dates.
- iScroll: pour la simulation d'un scroll comme iOS.

Le fichier main.js contient également le code pour les notifications push.
Les fonction de callback pour les notifications doivent se trouver dans le scope global
de Javascript et pour cela ces fonctions ne sont pas encapsulés dans des modules comme
c'est le cas pour les autres composants.

### controller.js

Le fonctionnement de l'application ressemble à celui de jQuery mobile.
Les pages sont chargées en modifiant l'action des balises `<a>`.

Ce fichier est également responsable de l'affichage du menu,
du monitoring de la connexion Internet et
de la réinitialisation des scrollview lorsque l'orientation du device change
(l'espace en largeur étant plus ou grand il faut indiquer à iScroll de recalculer
sa hauteur pour que le scroll s'effectue correctement)

Le fichier controller.js charge tous les controllers de page.
Chaque page possède son propre controller pour gérer ses données et ses actions.

Le fichier controller.js donne le contrôle au module navigation.js pour le chargement
des pages.

### navigation.js

La fonction principale de ce module est `changePage`.
Elle prend en paramètre la page à charger, les paramètres à transmettre au controller
de la page et un booléen permettant de savoir si l'action de changement de page
est un retour en arrière ou pas.

Dans le cas général le changement de page fonctionne comme suit:
1. la page est chargée en AJAX.
2. si on trouve un bouton back dans la page on le met à la place du bouton de naviagtion.
3. on set le titre de la page dans le header.
4. on récupère le contenu de la page (data-role="content") qui sera réellement
injecté dans le HTML. Le reste sert de metadata.
5. Le contenu de la page à charger est placé en position absolue
à gauche ou à droite de la page actuelle (selon le sens de la navigation).
6. Une animation effectue la transition puis reset le css sur le contenu venant d'être chargé.
7. Au cours du changement de page différentes fonctions sont appelées sur le controller
de la page chargée et de la page en chargement.

### Les Controllers

Des méthodes d'un controller sont automatiquement appelée
lors d'un changement de page.

- init: Appelé avant l'animation lors du chargement d'une page.
- onshow: Appelé sur le controller de la page en chargement lorsque la transition vient de se finir.
- onhide: Appelé sur le controller de la page précédemment chargé lorsque la transition vient de se finir.

Libre ensuite à chaque controller de définir ses propres méthodes.
La plupart des controllers suivent la même logique : chargement des données,
enregistrement dans local storage pour garder le contenu en offline,
mise à jour de l'UI.

### loading.js

Permet de présenter une popup d'attente lors du chargement des données.

### config.json

En dernier recours s'il est impossible de charger la config à partir du server
ce fichier représente la dernière config existante au moment de la release.
(peut sauver des vies)

### i18n.js string.js

Modules pour l'i18n. Non utilisé.

### api.js

Etant donnée la simplicité du chargement des données,
ce module n'est que très peu utilisé.

## DONE/TODO

- Seules les news fonctionnent parce que la source est Twitter.
- Les autres pages ne fonctionnent plus car les interfaces php n'existent plus.
- Il faut certainement régénérer des certificats SSL pour les notifications Push
sur Apple Developer.
- les icones et splashscreen ont été remis.
- le plugin PushPlugin a été mis à jour.
- la récupération du token fonctionne bien sur iOS.
Cependant il faut tester la boucle complète avec les certificats
et l'envoi de notification pour voir s'il n'y a pas d'éventuelles régression
à ce niveau.
- Compatibilité iOS 7 (menu etc.). La manière dont les images CSS sont définies ne semble plus être
la bonne technique pour afficher des images rétina. Fonctionne toujours sur Android cependant.
- ci-joints des fichiers JSON d'exemple de ce que chaque page attend comme données.


## ++

Backup du repo:  
`git archive HEAD | gzip > ictspring-app.tar.gz`
