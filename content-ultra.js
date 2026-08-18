(() => {
  const parseWords = (raw, level) => raw.trim().split('\n').map(line => {
    const [en, fr, theme] = line.split('|');
    return { en, fr, theme, level };
  });

  const debutant = parseWords(`
airport|aéroport|voyage
passport|passeport|voyage
suitcase|valise|voyage
ticket|billet|voyage
platform|quai|voyage
bus stop|arrêt de bus|voyage
seat|siège|voyage
map|carte|voyage
road|route|ville
street|rue|ville
avenue|avenue|ville
square|place|ville
bridge|pont|ville
traffic light|feu de circulation|ville
crosswalk|passage piéton|ville
corner|coin de rue|ville
bakery|boulangerie|ville
pharmacy|pharmacie|ville
hospital|hôpital|ville
library|bibliothèque|ville
museum|musée|ville
park|parc|ville
restaurant|restaurant|nourriture
menu|menu|nourriture
fork|fourchette|nourriture
knife|couteau|nourriture
spoon|cuillère|nourriture
plate|assiette|nourriture
glass|verre|nourriture
bottle|bouteille|nourriture
juice|jus|nourriture
coffee|café|nourriture
tea|thé|nourriture
butter|beurre|nourriture
flour|farine|nourriture
onion|oignon|nourriture
garlic|ail|nourriture
pepper|poivre|nourriture
strawberry|fraise|nourriture
pear|poire|nourriture
peach|pêche|nourriture
lemon|citron|nourriture
watermelon|pastèque|nourriture
vegetable|légume|nourriture
fruit|fruit|nourriture
shirt|chemise|vetements
T-shirt|tee-shirt|vetements
trousers|pantalon|vetements
shorts|short|vetements
dress|robe|vetements
skirt|jupe|vetements
coat|manteau|vetements
jacket|veste|vetements
sweater|pull|vetements
shoes|chaussures|vetements
socks|chaussettes|vetements
hat|chapeau|vetements
cap|casquette|vetements
gloves|gants|vetements
scarf|écharpe|vetements
belt|ceinture|vetements
pocket|poche|vetements
sunny|ensoleillé|meteo
cloudy|nuageux|meteo
rainy|pluvieux|meteo
windy|venteux|meteo
storm|orage|meteo
snow|neige|meteo
rain|pluie|meteo
cloud|nuage|meteo
wind|vent|meteo
weather|météo|meteo
spring|printemps|temps
summer|été|temps
autumn|automne|temps
winter|hiver|temps
morning|matin|temps
afternoon|après-midi|temps
evening|soir|temps
midnight|minuit|temps
minute|minute|temps
hour|heure|temps
week|semaine|temps
month|mois|temps
year|année|temps
Monday|lundi|temps
Tuesday|mardi|temps
Wednesday|mercredi|temps
Thursday|jeudi|temps
Friday|vendredi|temps
Saturday|samedi|temps
Sunday|dimanche|temps
January|janvier|temps
February|février|temps
March|mars|temps
April|avril|temps
May|mai|temps
June|juin|temps
July|juillet|temps
August|août|temps
September|septembre|temps
October|octobre|temps
November|novembre|temps
December|décembre|temps
shoulder|épaule|corps
neck|cou|corps
knee|genou|corps
elbow|coude|corps
stomach|ventre|corps
chest|poitrine|corps
skin|peau|corps
blood|sang|corps
pain|douleur|sante
cold|rhume|sante
cough|toux|sante
fever|fièvre|sante
medicine|médicament|sante
doctor|médecin|sante
nurse|infirmier|sante
dentist|dentiste|sante
healthy|en bonne santé|sante
sick|malade|sante
happy|heureux|emotions
sad|triste|emotions
angry|en colère|emotions
afraid|effrayé|emotions
surprised|surpris|emotions
excited|enthousiaste|emotions
worried|inquiet|emotions
calm|calme|emotions
proud|fier|emotions
bored|ennuyé|emotions
computer|ordinateur|technologie
phone|téléphone|technologie
tablet|tablette|technologie
screen|écran|technologie
keyboard|clavier|technologie
mouse pad|tapis de souris|technologie
charger|chargeur|technologie
battery|batterie|technologie
camera|appareil photo|technologie
internet|internet|technologie
website|site internet|technologie
password|mot de passe|technologie
message|message|communication
email|e-mail|communication
call|appel|communication
photo|photo|technologie
video|vidéo|technologie
button|bouton|technologie
file|fichier|technologie
folder|dossier|technologie
save|enregistrer|actions
delete|supprimer|actions
open|ouvrir|actions
close|fermer|actions
start|commencer|actions
stop|arrêter|actions
wait|attendre|actions
bring|apporter|actions
take|prendre|actions
give|donner|actions
show|montrer|actions
find|trouver|actions
choose|choisir|actions
need|avoir besoin|actions
want|vouloir|actions
remember|se souvenir|actions
forget|oublier|actions
win|gagner|sport
lose|perdre|sport
score|marquer|football
pass|faire une passe|football
shoot|tirer|football
defend|défendre|football
attack|attaquer|football
referee|arbitre|football
stadium|stade|football
training|entraînement|sport
player|joueur|football
team|équipe|football
ball|ballon|football
goal|but|football
match|match|football
`, 'debutant');

  const moyen = parseWords(`
reservation|réservation|voyage
departure|départ|voyage
arrival|arrivée|voyage
destination|destination|voyage
luggage|bagages|voyage
boarding pass|carte d'embarquement|voyage
gate|porte d'embarquement|voyage
delay|retard|voyage
cancelled|annulé|voyage
journey|trajet|voyage
trip|voyage|voyage
abroad|à l'étranger|voyage
directions|itinéraire|ville
intersection|intersection|ville
neighbourhood|quartier|ville
suburb|banlieue|ville
town hall|mairie|ville
police station|commissariat|ville
post office|bureau de poste|ville
shopping centre|centre commercial|commerce
cash|espèces|commerce
receipt|ticket de caisse|commerce
change|monnaie|commerce
price|prix|commerce
discount|réduction|commerce
sale|soldes|commerce
customer|client|commerce
cashier|caissier|commerce
size|taille|commerce
cheap|bon marché|commerce
expensive|cher|commerce
order|commander|nourriture
bill|addition|nourriture
tip|pourboire|nourriture
starter|entrée|nourriture
main course|plat principal|nourriture
dessert|dessert|nourriture
delicious|délicieux|nourriture
spicy|épicé|nourriture
sweet|sucré|nourriture
bitter|amer|nourriture
recipe|recette|nourriture
ingredient|ingrédient|nourriture
boil|faire bouillir|nourriture
fry|faire frire|nourriture
bake|cuire au four|nourriture
slice|trancher|nourriture
mix|mélanger|nourriture
appointment|rendez-vous|sante
symptom|symptôme|sante
treatment|traitement|sante
injury|blessure|sante
headache|mal de tête|sante
stomach ache|mal de ventre|sante
sore throat|mal de gorge|sante
allergy|allergie|sante
prescription|ordonnance|sante
pharmacist|pharmacien|sante
recover|récupérer|sante
exercise|exercice|sport
strength|force|sport
speed|vitesse|sport
endurance|endurance|sport
warm-up|échauffement|sport
stretch|s'étirer|sport
competition|compétition|sport
championship|championnat|sport
opponent|adversaire|sport
victory|victoire|sport
defeat|défaite|sport
midfielder|milieu de terrain|football
striker|attaquant|football
defender|défenseur|football
goalkeeper|gardien|football
penalty|penalty|football
corner kick|corner|football
free kick|coup franc|football
offside|hors-jeu|football
coach|entraîneur|football
substitute|remplaçant|football
kick-off|coup d'envoi|football
league|championnat|football
manager|responsable|travail
colleague|collègue|travail
meeting|réunion|travail
schedule|planning|travail
deadline|date limite|travail
project|projet|travail
task|tâche|travail
report|rapport|travail
office|bureau|travail
salary|salaire|travail
contract|contrat|travail
break|pause|travail
shift|service|travail
experience|expérience|travail
skill|compétence|travail
apply|postuler|travail
interview|entretien|travail
hire|embaucher|travail
network|réseau|technologie
software|logiciel|technologie
hardware|matériel informatique|technologie
application|application|technologie
update|mise à jour|technologie
download|télécharger|technologie
upload|téléverser|technologie
connection|connexion|technologie
account|compte|technologie
settings|paramètres|technologie
notification|notification|technologie
privacy|confidentialité|technologie
security|sécurité|technologie
backup|sauvegarde|technologie
search engine|moteur de recherche|technologie
link|lien|technologie
attachment|pièce jointe|communication
conversation|conversation|communication
explain|expliquer|communication
describe|décrire|communication
repeat|répéter|communication
pronounce|prononcer|communication
meaning|signification|communication
opinion|opinion|societe
agree|être d'accord|communication
disagree|ne pas être d'accord|communication
suggest|suggérer|communication
promise|promettre|communication
invite|inviter|communication
refuse|refuser|communication
accept|accepter|communication
probably|probablement|nuances
perhaps|peut-être|nuances
actually|en fait|nuances
usually|habituellement|nuances
rarely|rarement|nuances
already|déjà|temps
still|encore|temps
yet|encore / déjà|temps
recently|récemment|temps
immediately|immédiatement|temps
careful|prudent|adjectifs
useful|utile|adjectifs
useless|inutile|adjectifs
comfortable|confortable|adjectifs
dangerous|dangereux|adjectifs
safe|sûr|adjectifs
crowded|bondé|adjectifs
quiet|calme|adjectifs
noisy|bruyant|adjectifs
available|disponible|adjectifs
`, 'moyen');

  const confirme = parseWords(`
achievement|réussite|abstrait
challenge|défi|abstrait
behaviour|comportement|societe
awareness|sensibilisation|societe
responsibility|responsabilité|societe
commitment|engagement|societe
leadership|leadership|travail
strategy|stratégie|travail
priority|priorité|travail
objective|objectif|travail
outcome|résultat|travail
performance|performance|travail
feedback|retour|communication
improvement|amélioration|travail
requirement|exigence|travail
procedure|procédure|travail
policy|politique / règle|travail
budget|budget|travail
expense|dépense|travail
income|revenu|travail
investment|investissement|commerce
savings|économies|commerce
debt|dette|commerce
loan|prêt|commerce
interest rate|taux d'intérêt|commerce
insurance|assurance|commerce
agreement|accord|communication
statement|déclaration|communication
argument|argument|communication
evidence|preuve|communication
assumption|hypothèse|nuances
consequence|conséquence|abstrait
advantage|avantage|abstrait
drawback|inconvénient|abstrait
issue|problème / enjeu|abstrait
solution|solution|abstrait
approach|approche|abstrait
purpose|objectif / but|abstrait
context|contexte|abstrait
point of view|point de vue|communication
perspective|perspective|communication
reliable|fiable|adjectifs
accurate|précis|adjectifs
relevant|pertinent|adjectifs
efficient|efficace|adjectifs
sustainable|durable|environnement
renewable|renouvelable|environnement
pollution|pollution|environnement
waste|déchets|environnement
recycling|recyclage|environnement
climate|climat|environnement
emission|émission|environnement
resource|ressource|environnement
energy consumption|consommation d'énergie|environnement
carbon footprint|empreinte carbone|environnement
biodiversity|biodiversité|environnement
conservation|préservation|environnement
drought|sécheresse|environnement
flood|inondation|environnement
heatwave|canicule|environnement
artificial intelligence|intelligence artificielle|technologie
machine learning|apprentissage automatique|technologie
database|base de données|technologie
server|serveur|technologie
cloud computing|informatique en nuage|technologie
source code|code source|technologie
bug|bogue|technologie
feature|fonctionnalité|technologie
interface|interface|technologie
user experience|expérience utilisateur|technologie
encryption|chiffrement|technologie
authentication|authentification|technologie
permission|autorisation|technologie
vulnerability|vulnérabilité|technologie
bandwidth|bande passante|technologie
latency|latence|technologie
deployment|déploiement|technologie
maintenance|maintenance|technologie
troubleshoot|diagnostiquer un problème|technologie
figure out|comprendre / trouver|phrasal
find out|découvrir|phrasal
carry out|effectuer|phrasal
set up|mettre en place|phrasal
work out|résoudre / s'entraîner|phrasal
look after|s'occuper de|phrasal
look for|chercher|phrasal
look forward to|attendre avec impatience|phrasal
give up|abandonner|phrasal
pick up|ramasser / récupérer|phrasal
turn down|refuser / baisser|phrasal
turn up|arriver / augmenter|phrasal
run out of|ne plus avoir de|phrasal
come across|tomber sur|phrasal
get along with|bien s'entendre avec|phrasal
keep up with|suivre le rythme de|phrasal
bring up|évoquer|phrasal
point out|faire remarquer|phrasal
take over|prendre le contrôle|phrasal
sort out|régler|phrasal
although|bien que|nuances
whereas|tandis que|nuances
however|cependant|nuances
therefore|par conséquent|nuances
moreover|de plus|nuances
nevertheless|néanmoins|nuances
otherwise|sinon|nuances
unless|à moins que|nuances
despite|malgré|nuances
regardless|indépendamment|nuances
roughly|approximativement|nuances
slightly|légèrement|nuances
significantly|considérablement|nuances
apparently|apparemment|nuances
ultimately|en fin de compte|nuances
`, 'confirme');

  window.QUIZ_EXTRA_WORDS = (window.QUIZ_EXTRA_WORDS || []).concat(debutant, moyen, confirme);

  const phrases = [
    ['Could I have the bill, please?','Puis-je avoir l’addition, s’il vous plaît ?','moyen','nourriture'],
    ['My train has been delayed by twenty minutes.','Mon train a vingt minutes de retard.','moyen','voyage'],
    ['Turn right at the next traffic light.','Tourne à droite au prochain feu.','debutant','ville'],
    ['I need to charge my phone.','J’ai besoin de recharger mon téléphone.','debutant','technologie'],
    ['Please send me the file by email.','Envoie-moi le fichier par e-mail, s’il te plaît.','moyen','technologie'],
    ['I forgot my password again.','J’ai encore oublié mon mot de passe.','moyen','technologie'],
    ['The goalkeeper made an excellent save.','Le gardien a fait un excellent arrêt.','moyen','football'],
    ['Our team is training for the championship.','Notre équipe s’entraîne pour le championnat.','moyen','football'],
    ['I have an appointment with the doctor tomorrow.','J’ai rendez-vous chez le médecin demain.','moyen','sante'],
    ['You should drink more water after exercise.','Tu devrais boire plus d’eau après l’exercice.','moyen','sante'],
    ['The meeting starts at half past nine.','La réunion commence à neuf heures et demie.','moyen','travail'],
    ['We must finish this project before Friday.','Nous devons terminer ce projet avant vendredi.','moyen','travail'],
    ['I completely agree with your point of view.','Je suis totalement d’accord avec ton point de vue.','confirme','communication'],
    ['Could you explain that in a different way?','Pourrais-tu expliquer cela autrement ?','moyen','communication'],
    ['Although the task was difficult, we completed it.','Bien que la tâche soit difficile, nous l’avons terminée.','confirme','travail'],
    ['The new update improves performance and security.','La nouvelle mise à jour améliore les performances et la sécurité.','confirme','technologie'],
    ['We need a more sustainable solution.','Nous avons besoin d’une solution plus durable.','confirme','environnement'],
    ['Recycling helps reduce the amount of waste.','Le recyclage aide à réduire la quantité de déchets.','confirme','environnement'],
    ['I am looking forward to seeing you again.','J’ai hâte de te revoir.','confirme','phrasal'],
    ['We ran out of milk this morning.','Nous n’avions plus de lait ce matin.','confirme','phrasal'],
    ['Please turn down the music a little.','Baisse un peu la musique, s’il te plaît.','moyen','phrasal'],
    ['I came across an interesting article yesterday.','Je suis tombé sur un article intéressant hier.','confirme','phrasal'],
    ['This information appears to be reliable.','Cette information semble fiable.','confirme','nuances'],
    ['The result was slightly better than expected.','Le résultat était légèrement meilleur que prévu.','confirme','nuances'],
    ['I usually take the bus to work.','Je prends habituellement le bus pour aller au travail.','moyen','voyage'],
    ['The children are playing in the park.','Les enfants jouent dans le parc.','debutant','ville'],
    ['Put your coat on because it is cold outside.','Mets ton manteau car il fait froid dehors.','moyen','vetements'],
    ['It is going to rain this afternoon.','Il va pleuvoir cet après-midi.','moyen','meteo'],
    ['What time does the shop close?','À quelle heure le magasin ferme-t-il ?','moyen','commerce'],
    ['This jacket is too expensive for me.','Cette veste est trop chère pour moi.','moyen','commerce'],
    ['I would like to make a reservation for two people.','Je voudrais réserver pour deux personnes.','moyen','nourriture'],
    ['Can I try these shoes on?','Puis-je essayer ces chaussures ?','moyen','commerce'],
    ['My battery is almost empty.','Ma batterie est presque vide.','debutant','technologie'],
    ['The internet connection is very slow today.','La connexion internet est très lente aujourd’hui.','moyen','technologie'],
    ['Always back up important files.','Sauvegarde toujours les fichiers importants.','confirme','technologie'],
    ['The company is looking for experienced workers.','L’entreprise recherche des travailleurs expérimentés.','confirme','travail'],
    ['He applied for a new job last week.','Il a postulé à un nouvel emploi la semaine dernière.','moyen','travail'],
    ['The deadline has been moved to Monday.','La date limite a été repoussée à lundi.','confirme','travail'],
    ['We should consider both advantages and drawbacks.','Nous devrions considérer les avantages et les inconvénients.','confirme','abstrait'],
    ['There is not enough evidence to support that claim.','Il n’y a pas assez de preuves pour soutenir cette affirmation.','confirme','communication']
  ].map(([en,fr,level,theme]) => ({en,fr,level,theme}));
  window.QUIZ_EXTRA_PHRASES = (window.QUIZ_EXTRA_PHRASES || []).concat(phrases);

  const dialogues = [
    ['Can I help you?','Yes, I am looking for a jacket.','Oui, je cherche une veste.','moyen'],
    ['What time is your train?','It leaves at quarter past eight.','Il part à huit heures et quart.','moyen'],
    ['Do you have a reservation?','Yes, it is under the name Mboup.','Oui, elle est au nom de Mboup.','moyen'],
    ['What seems to be the problem?','I have a sore throat and a fever.','J’ai mal à la gorge et de la fièvre.','moyen'],
    ['Could you repeat that, please?','Of course, I will speak more slowly.','Bien sûr, je vais parler plus lentement.','moyen'],
    ['Where can I charge my phone?','There is a socket near the table.','Il y a une prise près de la table.','moyen'],
    ['How did the team play?','They defended well and created many chances.','Ils ont bien défendu et créé beaucoup d’occasions.','confirme'],
    ['Have you sent the report?','Yes, I emailed it this morning.','Oui, je l’ai envoyé par e-mail ce matin.','moyen'],
    ['What is the main advantage?','It saves both time and money.','Cela économise du temps et de l’argent.','confirme'],
    ['Why should we update the software?','The update fixes security issues.','La mise à jour corrige des problèmes de sécurité.','confirme'],
    ['What do you mean by sustainable?','I mean something that can last without harming the environment.','Je veux dire quelque chose de durable sans nuire à l’environnement.','confirme'],
    ['Are you free this afternoon?','Yes, after three o’clock.','Oui, après quinze heures.','debutant'],
    ['Which way is the museum?','Go straight, then take the second street on the right.','Va tout droit puis prends la deuxième rue à droite.','moyen'],
    ['Would you like dessert?','No thank you, I am full.','Non merci, je n’ai plus faim.','debutant'],
    ['Did you enjoy the film?','Yes, the story was really interesting.','Oui, l’histoire était vraiment intéressante.','moyen']
  ].map(([prompt,answer,answerFr,level]) => ({prompt,answer,answerFr,level}));
  window.QUIZ_DIALOGUES = (window.QUIZ_DIALOGUES || []).concat(dialogues);

  const grammar = [
    ['He ___ to work every morning.','goes',['goes','go','going','went'],'Avec he au présent simple, on ajoute généralement -s au verbe.','debutant'],
    ['We ___ ready.','are',['are','is','am','be'],'Avec we, le verbe be devient are.','debutant'],
    ['She can ___ very fast.','run',['run','runs','running','ran'],'Après can, on utilise la base verbale sans to.','debutant'],
    ['There ___ three books on the desk.','are',['are','is','am','has'],'There are s’utilise devant un nom pluriel.','debutant'],
    ['I do not ___ coffee.','drink',['drink','drinks','drank','drinking'],'Après do not, le verbe reste à la base.','debutant'],
    ['___ you like football?','Do',['Do','Does','Are','Is'],'Au présent simple avec you, la question commence par do.','debutant'],
    ['She ___ not like cold weather.','does',['does','do','is','has'],'Avec she au présent simple négatif, on utilise does not.','debutant'],
    ['We ___ dinner at seven yesterday.','ate',['ate','eat','eaten','eating'],'Yesterday appelle ici le prétérit ; ate est le passé de eat.','moyen'],
    ['I have never ___ to London.','been',['been','went','go','being'],'Avec have never, on utilise le participe passé ; been est celui de be.','moyen'],
    ['They ___ playing when I arrived.','were',['were','was','are','have'],'Au past continuous avec they, on utilise were + verbe en -ing.','moyen'],
    ['If you study, you ___ improve.','will',['will','would','did','have'],'Le premier conditionnel utilise if + présent, puis will + base verbale.','moyen'],
    ['She has worked here ___ five years.','for',['for','since','during','from'],'For introduit une durée ; since introduit un point de départ.','moyen'],
    ['He has worked here ___ 2022.','since',['since','for','during','ago'],'Since introduit un point de départ précis.','moyen'],
    ['This exercise is ___ than the previous one.','easier',['easier','easy','easiest','more easy'],'Le comparatif régulier de easy est easier.','moyen'],
    ['That was the ___ match of the season.','best',['best','better','good','well'],'Best est le superlatif irrégulier de good.','moyen'],
    ['You ___ wear a seat belt.','must',['must','might','could have','would'],'Must exprime ici une obligation.','moyen'],
    ['The email ___ sent yesterday.','was',['was','were','has','did'],'Au passif passé avec un sujet singulier : was + participe passé.','moyen'],
    ['I ___ call you later if I have time.','will',['will','would','had','am'],'Le premier conditionnel emploie will dans la proposition principale.','moyen'],
    ['If I ___ you, I would accept the offer.','were',['were','am','will be','have been'],'Dans le second conditionnel, were est la forme classique avec I dans cette structure.','confirme'],
    ['By next Friday, we ___ the project.','will have finished',['will have finished','will finish','finished','have finish'],'Le future perfect décrit une action terminée avant un moment futur.','confirme'],
    ['The data should ___ regularly.','be backed up',['be backed up','back up','be backing up','backed up'],'Après should au passif : be + participe passé.','confirme'],
    ['She admitted ___ the mistake.','making',['making','to make','make','made'],'Admit est normalement suivi d’un gérondif en -ing.','confirme'],
    ['Despite ___ expensive, the device sold well.','being',['being','be','was','to be'],'Despite est suivi d’un nom ou d’une forme en -ing.','confirme'],
    ['I wish I ___ more time.','had',['had','have','will have','would have'],'Wish pour une situation présente irréelle se construit souvent avec un prétérit.','confirme'],
    ['Hardly ___ started when the power went out.','had we',['had we','we had','did we','we have'],'Après hardly en tête de phrase, on utilise l’inversion avec l’auxiliaire.','confirme'],
    ['The sooner we leave, the ___ we will arrive.','earlier',['earlier','early','earliest','more early'],'La structure the + comparatif, the + comparatif exprime une relation progressive.','confirme'],
    ['Had they known, they ___ differently.','would have acted',['would have acted','will act','acted','would act'],'Cette inversion remplace if they had known et appelle un conditionnel passé.','confirme'],
    ['It is important that every applicant ___ the form.','complete',['complete','completes','completed','completing'],'Après une exigence formelle, l’anglais peut utiliser le subjonctif avec la base verbale.','confirme'],
    ['Neither the manager nor the employees ___ available.','were',['were','was','is','be'],'Avec le sujet le plus proche au pluriel employees, were convient ici.','confirme'],
    ['No sooner had we arrived ___ it started raining.','than',['than','when','that','then'],'La structure figée est no sooner ... than.','confirme']
  ].map(([question,answer,choices,explanation,level]) => ({question,answer,choices,explanation,level}));
  window.QUIZ_GRAMMAR = (window.QUIZ_GRAMMAR || []).concat(grammar);
})();
