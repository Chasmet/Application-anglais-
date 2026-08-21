(() => {
const topics=[
['🏨','Hôtel','Arrivée et check-in','réceptionniste','reservation|réservation|ré-zeur-véï-cheun;available|disponible|e-véï-le-beul;quiet|calme|kwaï-eut'],
['🏨','Hôtel','Problème dans la chambre','réceptionniste','issue|problème|i-chou;heating|chauffage|hi-ting;replace|remplacer|ri-pléïss'],
['🍽️','Restaurant','Réserver une table','serveur','booking|réservation|bou-king;available|disponible|e-véï-le-beul;table|table|téï-beul'],
['🍽️','Restaurant','Commander un repas','serveur','starter|entrée|star-teur;main course|plat principal|méïn kors;recommend|recommander|re-keu-mend'],
['🍽️','Restaurant','Signaler une allergie','serveur','allergic|allergique|e-leur-djik;ingredients|ingrédients|in-gri-di-ents;instead|à la place|in-sted'],
['☕','Café','Commander et modifier une boisson','barista','decaf|décaféiné|di-kaf;takeaway|à emporter|téïk-e-wéï;change|modifier|tchéïndj'],
['🛒','Courses','Demander où trouver un produit','employé','aisle|rayon|aïl;out of stock|en rupture|aout ov stok;brand|marque|brand'],
['🛒','Courses','Réclamer après une erreur de prix','caissier','receipt|ticket de caisse|ri-siit;charged|facturé|tchardjd;refund|remboursement|ri-feund'],
['👕','Shopping','Essayer un vêtement','vendeur','fitting room|cabine d’essayage|fi-ting roum;size|taille|saïz;fit|aller à la bonne taille|fit'],
['👕','Shopping','Retourner un article','vendeur','return|retourner|ri-teurn;exchange|échanger|eks-tchéïndj;receipt|ticket|ri-siit'],
['✈️','Aéroport','Enregistrement du vol','agent','boarding pass|carte d’embarquement|bor-ding pass;luggage|bagages|leu-guidj;window seat|siège côté fenêtre|win-do séït'],
['✈️','Aéroport','Vol retardé','agent','delay|retard|di-léï;connection|correspondance|keu-nek-cheun;rebook|réserver sur un autre vol|ri-bouk'],
['✈️','Aéroport','Bagage perdu','agent','missing|manquant|mi-sing;baggage claim|service bagages|ba-guidj cléïm;description|description|di-skrip-cheun'],
['🚆','Train','Acheter un billet','agent','single|aller simple|sin-gueul;return ticket|aller-retour|ri-teurn ti-kit;platform|quai|plat-form'],
['🚆','Train','Train annulé','agent','cancelled|annulé|kan-seuld;alternative|solution alternative|ol-teur-na-tiv;refund|remboursement|ri-feund'],
['🚕','Taxi','Expliquer une destination','chauffeur','destination|destination|des-ti-néï-cheun;traffic|circulation|tra-fik;drop me off|déposez-moi|drop mi of'],
['🚗','Location voiture','Récupérer une voiture','agent','rental|location|ren-teul;insurance|assurance|in-chou-rens;fuel|carburant|fioul'],
['🚗','Voiture','Signaler un problème mécanique','garagiste','warning light|voyant|wor-ning laït;brakes|freins|bréïks;repair|réparer|ri-pèr'],
['🏥','Santé','Prendre rendez-vous','secrétaire','appointment|rendez-vous|e-point-ment;available|disponible|e-véï-le-beul;urgent|urgent|eur-djent'],
['🏥','Santé','Expliquer des symptômes','médecin','symptoms|symptômes|simp-teums;pain|douleur|péïn;since|depuis|sinss'],
['💊','Pharmacie','Demander un médicament','pharmacien','prescription|ordonnance|pri-skrip-cheun;dosage|dosage|do-sidj;side effects|effets secondaires|saïd i-fekts'],
['💼','Travail','Se présenter à un nouveau collègue','collègue','department|service|di-part-ment;role|poste|rol;responsible for|responsable de|ri-spon-se-beul for'],
['💼','Travail','Faire le point sur un projet','manager','deadline|date limite|ded-laïne;progress|avancement|pro-grès;priority|priorité|praï-o-ri-ti'],
['💼','Travail','Demander un délai','manager','extension|prolongation|eks-ten-cheun;delay|retard|di-léï;estimate|estimation|es-ti-meït'],
['💼','Travail','Réunion et désaccord','collègue','agree|être d’accord|e-grii;concern|préoccupation|keun-seurn;suggest|suggérer|seu-djest'],
['💼','Travail','Entretien d’embauche','recruteur','experience|expérience|eks-pi-ri-ens;strength|point fort|strengss;available|disponible|e-véï-le-beul'],
['🏠','Logement','Visiter un appartement','agent immobilier','rent|loyer|rent;deposit|dépôt de garantie|di-po-zit;included|inclus|in-klou-did'],
['🏠','Logement','Problème avec le propriétaire','propriétaire','leak|fuite|liik;repair|réparation|ri-pèr;urgent|urgent|eur-djent'],
['👨‍👩‍👧','École','Parler avec un professeur','professeur','progress|progrès|pro-grès;homework|devoirs|hom-work;improve|s’améliorer|im-prouv'],
['🏫','École','Inscription à une activité','secrétaire','registration|inscription|ré-djis-tréï-cheun;schedule|planning|sked-joul;fee|frais|fii'],
['⚽','Sport','S’inscrire dans un club','entraîneur','training|entraînement|tréï-ning;membership|adhésion|mem-beur-chip;position|poste|peu-zi-cheun'],
['⚽','Sport','Parler après un match','coéquipier','performance|performance|peu-for-mens;defend|défendre|di-fend;improve|améliorer|im-prouv'],
['📱','Téléphone','Appeler le service client','conseiller','account|compte|e-kaount;issue|problème|i-chou;subscription|abonnement|seub-skrip-cheun'],
['🌐','Internet','Panne de connexion','technicien','connection|connexion|keu-nek-cheun;router|routeur|raou-teur;restart|redémarrer|ri-start'],
['🏦','Banque','Ouvrir un compte','conseiller','account|compte|e-kaount;fees|frais|fiiz;direct debit|prélèvement|daï-rekt dé-bit'],
['🏦','Banque','Carte bancaire bloquée','conseiller','blocked|bloqué|blokt;transaction|transaction|tran-zak-cheun;verify|vérifier|vé-ri-faï'],
['📦','Livraison','Colis non livré','service client','delivery|livraison|di-li-ve-ri;tracking|suivi|tra-king;missing|manquant|mi-sing'],
['🏛️','Administration','Demander une information','agent','form|formulaire|form;document|document|do-kiou-ment;deadline|date limite|ded-laïne'],
['👮','Police','Déclarer un objet perdu','policier','lost|perdu|lost;report|déclaration|ri-port;description|description|di-skrip-cheun'],
['🏙️','Voisinage','Discuter d’un problème de bruit','voisin','noise|bruit|noïz;late|tard|léït;mind|déranger|maïnd']
];
const levels=[
{key:'A2',label:'A2 • Facile',rank:1,suffix:'Situation simple',tone:'simple'},
{key:'A2+',label:'A2+ • Intermédiaire',rank:2,suffix:'Avec une demande supplémentaire',tone:'polite'},
{key:'B1',label:'B1 • Autonome',rank:3,suffix:'Avec un imprévu à résoudre',tone:'detail'},
{key:'B1+',label:'B1+ • Difficile',rank:4,suffix:'Négociation et justification',tone:'complex'}
];
const stageBank={
1:[
['Hello. How can I help you today?','Hello. I need some help, please.','Bonjour. J’ai besoin d’aide, s’il vous plaît.'],
['Good morning. What can I do for you?','Good morning. I would like some information, please.','Bonjour. Je voudrais quelques informations, s’il vous plaît.']
],
2:[
['Of course. Can you tell me a little more?','Yes. I would like to explain the situation.','Oui. Je voudrais expliquer la situation.'],
['Certainly. What exactly do you need?','I need to check a few details first.','Je dois d’abord vérifier quelques détails.']
],
3:[
['I understand. Is there anything else?','Yes, I also have one more question.','Oui, j’ai aussi une autre question.'],
['Thanks for explaining. What would be best for you?','The best solution for me would be a quick and simple option.','La meilleure solution pour moi serait une option rapide et simple.']
],
4:[
['We can do that, but there may be a small delay.','That is okay, but could you tell me how long it will take?','D’accord, mais pourriez-vous me dire combien de temps cela prendra ?'],
['There is one small problem with that option.','I see. What other option do you recommend?','Je vois. Quelle autre option recommandez-vous ?']
],
5:[
['Would you like me to confirm everything now?','Yes, please. Could you confirm the main details?','Oui, s’il vous plaît. Pourriez-vous confirmer les principaux détails ?'],
['Before we finish, do you have any questions?','Yes. Could you repeat the most important information?','Oui. Pourriez-vous répéter les informations les plus importantes ?']
],
6:[
['That is all sorted. Is there anything else I can do?','No, that is everything. Thank you for your help.','Non, c’est tout. Merci pour votre aide.'],
['Everything is confirmed now.','Perfect. Thank you very much. Have a nice day.','Parfait. Merci beaucoup. Bonne journée.']
]
};
function pronunciation(text){return text.toLowerCase().replace(/th/g,'z').replace(/you/g,'iou').replace(/would/g,'woud').replace(/could/g,'koud').replace(/please/g,'pliiz').replace(/thank/g,'sènk').replace(/help/g,'help').replace(/i /g,'aï ');}
function specificLines(topic,level){
const title=topic[2].toLowerCase();
const hard=level.rank>=3;
return [
{npc:`I see you are here about ${title}. What would you like to do?`,user:`I would like to deal with ${title} today, please.`,fr:`Je voudrais m’occuper de « ${topic[2]} » aujourd’hui, s’il vous plaît.`},
{npc:hard?'There are two possible options. One is faster, but the other is more flexible. Which matters more to you?':'Would you prefer the standard option or the quicker option?',user:hard?'I would prefer the more flexible option, as long as it does not take too long.':'I would prefer the quicker option, please.',fr:hard?'Je préférerais l’option la plus flexible, tant que cela ne prend pas trop de temps.':'Je préférerais l’option la plus rapide, s’il vous plaît.'},
{npc:level.rank===4?'I may need you to justify that request before I can approve it.':'Could you confirm that this solution works for you?',user:level.rank===4?'Of course. The main reason is that I need a reliable solution today, and the alternative would create another problem.':'Yes, that solution works for me.',fr:level.rank===4?'Bien sûr. La raison principale est que j’ai besoin d’une solution fiable aujourd’hui, et l’alternative créerait un autre problème.':'Oui, cette solution me convient.'}
];
}
const scenarios=[];
topics.forEach((topic,ti)=>levels.forEach((level,li)=>{
const specific=specificLines(topic,level); const baseOffset=(ti+li)%2;
const turns=[];
turns.push({npc:stageBank[1][baseOffset][0],expected:stageBank[1][baseOffset][1],fr:stageBank[1][baseOffset][2]});
turns.push({npc:specific[0].npc,expected:specific[0].user,fr:specific[0].fr});
turns.push({npc:stageBank[2][(baseOffset+1)%2][0],expected:stageBank[2][(baseOffset+1)%2][1],fr:stageBank[2][(baseOffset+1)%2][2]});
turns.push({npc:specific[1].npc,expected:specific[1].user,fr:specific[1].fr});
turns.push({npc:stageBank[3][baseOffset][0],expected:stageBank[3][baseOffset][1],fr:stageBank[3][baseOffset][2]});
if(level.rank>=2)turns.push({npc:stageBank[4][(baseOffset+1)%2][0],expected:stageBank[4][(baseOffset+1)%2][1],fr:stageBank[4][(baseOffset+1)%2][2]});
if(level.rank>=3)turns.push({npc:specific[2].npc,expected:specific[2].user,fr:specific[2].fr});
turns.push({npc:stageBank[5][baseOffset][0],expected:stageBank[5][baseOffset][1],fr:stageBank[5][baseOffset][2]});
turns.push({npc:stageBank[6][(baseOffset+1)%2][0],expected:stageBank[6][(baseOffset+1)%2][1],fr:stageBank[6][(baseOffset+1)%2][2]});
turns.forEach(t=>t.pron=pronunciation(t.expected));
const vocab={};topic[4].split(';').forEach(x=>{const [en,fr,pron]=x.split('|');vocab[en]={fr,pron};});
scenarios.push({id:`oral-${ti+1}-${level.key.replace('+','p')}`,icon:topic[0],category:topic[1],title:`${topic[2]} — ${level.suffix}`,counterpart:topic[3],level:level.key,levelLabel:level.label,rank:level.rank,duration:level.rank<=2?'2–3 min':'3–4 min',goal:`Gérer ${topic[2].toLowerCase()} en anglais dans une situation réelle.`,vocab,turns});
}));
window.ADULT_ORAL_SCENARIOS=scenarios;
})();