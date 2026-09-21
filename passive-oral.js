(()=>{
const $=id=>document.getElementById(id);
const TOPICS=[
['daily','Réveil et matin','Je me lève tôt avant de préparer le petit-déjeuner.','I get up early before preparing breakfast.','Get up signifie se lever. Before plus un verbe en -ing peut introduire l’action suivante.'],
['daily','Courses alimentaires','Je cherche du lait sans lactose.','I am looking for lactose-free milk.','I am looking for signifie je cherche. Le présent continu décrit l’action en cours.'],
['daily','Rendez-vous','J’ai rendez-vous à trois heures cet après-midi.','I have an appointment at three this afternoon.','Have an appointment est l’expression naturelle pour dire avoir rendez-vous.'],
['daily','Téléphone','Je vais te rappeler dans dix minutes.','I will call you back in ten minutes.','Call back signifie rappeler. Will suivi du verbe exprime ici une décision future.'],
['daily','Météo','Il va probablement pleuvoir ce soir.','It will probably rain this evening.','Probably signifie probablement et se place généralement avant le verbe principal.'],
['home','Cuisine','Je coupe les oignons avant d’ajouter la viande.','I chop the onions before adding the meat.','Chop signifie couper en morceaux. After et before peuvent être suivis d’un verbe en -ing.'],
['home','Nettoyage','Je dois nettoyer la cuisine après le dîner.','I need to clean the kitchen after dinner.','Need to plus un verbe signifie avoir besoin de faire quelque chose ou devoir le faire.'],
['home','Lessive','La machine à laver est presque terminée.','The washing machine is almost finished.','Almost signifie presque. Washing machine veut dire machine à laver.'],
['home','Bricolage','Cette vis est trop serrée.','This screw is too tight.','Too plus un adjectif signifie trop. Tight veut dire serré.'],
['home','Jardin','Je vais arroser les plantes ce soir.','I am going to water the plants tonight.','Be going to sert à parler d’une intention déjà prévue.'],
['road','Voiture rouge','Une voiture rouge traverse le désert.','A red car crosses the desert.','Crosses prend es car le sujet est à la troisième personne du singulier.'],
['road','Embouteillage','Il y a beaucoup de circulation ce matin.','There is a lot of traffic this morning.','Traffic est indénombrable. On dit a lot of traffic et pas many traffics.'],
['road','Itinéraire','Tournez à gauche après le feu.','Turn left after the traffic light.','À l’impératif anglais, on commence directement par le verbe. Ici, Turn.'],
['road','Panne','Ma voiture ne démarre plus.','My car will not start.','Will not start peut décrire une voiture qui refuse de démarrer.'],
['road','Station-service','Je voudrais faire le plein, s’il vous plaît.','I would like to fill up, please.','Fill up signifie faire le plein. I would like est une formulation polie.'],
['work','Début de journée','Je commence le travail à sept heures trente.','I start work at seven thirty.','Le présent simple exprime une routine. Start work signifie commencer le travail.'],
['work','Consigne','Nous devons terminer cette zone avant midi.','We need to finish this area before noon.','Need to finish signifie devoir terminer. Noon veut dire midi.'],
['work','Collègue','Mon collègue m’a demandé de déplacer le véhicule.','My colleague asked me to move the vehicle.','Ask someone to plus un verbe signifie demander à quelqu’un de faire quelque chose.'],
['work','Réunion','La réunion a été reportée à demain.','The meeting has been postponed until tomorrow.','Has been postponed est une forme passive. Postpone signifie reporter.'],
['work','Retard','Je serai en retard d’environ dix minutes.','I will be about ten minutes late.','Be late signifie être en retard. About signifie environ.'],
['travel','Aéroport','Mon vol a été retardé de deux heures.','My flight has been delayed by two hours.','Has been delayed est une forme passive. By two hours indique ici la durée du retard.'],
['travel','Bagages','Où puis-je récupérer mes bagages ?','Where can I collect my luggage?','Where can I plus un verbe sert à demander où faire quelque chose. Luggage est indénombrable.'],
['travel','Hôtel','Je voudrais réserver une chambre pour deux nuits.','I would like to book a room for two nights.','Book a room signifie réserver une chambre. Would like est une forme polie.'],
['travel','Train','À quelle heure part le prochain train ?','What time does the next train leave?','Avec un verbe ordinaire au présent simple, la question utilise does.'],
['travel','Taxi','Pouvez-vous me déposer devant l’hôtel ?','Can you drop me off in front of the hotel?','Drop someone off signifie déposer quelqu’un en voiture.'],
['people','Désaccord','Je ne suis pas tout à fait d’accord.','I do not completely agree.','Agree signifie être d’accord. Completely signifie complètement ou tout à fait.'],
['people','Parler lentement','Peux-tu parler un peu plus lentement ?','Can you speak a little more slowly?','Après can, le verbe reste à la base. On dit can you speak.'],
['people','Comprendre','Je comprends ce que tu veux dire.','I understand what you mean.','What you mean signifie ce que tu veux dire.'],
['people','Invitation','Est-ce que tu veux venir dîner samedi ?','Would you like to come for dinner on Saturday?','Would you like to est une façon polie de proposer ou d’inviter.'],
['people','Excuse','Désolé, je n’ai pas entendu la dernière phrase.','Sorry, I did not hear the last sentence.','Did not suivi de la base verbale forme la négation au passé simple.'],
['health','Médecin','J’ai mal à la tête depuis ce matin.','I have had a headache since this morning.','Since introduit le point de départ. Le present perfect relie le passé au présent.'],
['health','Pharmacie','Avez-vous quelque chose contre la toux ?','Do you have anything for a cough?','Anything for a cough signifie quelque chose contre la toux.'],
['health','Douleur','J’ai mal au dos quand je me penche.','My back hurts when I bend down.','My back hurts signifie j’ai mal au dos. Bend down veut dire se pencher.'],
['health','Urgence','J’ai besoin d’un médecin immédiatement.','I need a doctor immediately.','Need plus un nom exprime un besoin direct. Immediately signifie immédiatement.'],
['health','Ordonnance','Combien de fois par jour dois-je le prendre ?','How many times a day should I take it?','Should I plus un verbe sert à demander un conseil ou une consigne.'],
['shop','Vêtements','Je cherche cette veste en taille moyenne.','I am looking for this jacket in a medium size.','Look for signifie chercher. In a medium size signifie en taille moyenne.'],
['shop','Prix','Combien coûte cet article ?','How much does this item cost?','How much does this item cost est la structure standard pour demander un prix.'],
['shop','Retour','Je voudrais retourner cet article.','I would like to return this item.','Return an item signifie retourner un article au magasin.'],
['shop','Paiement','Puis-je payer par carte ?','Can I pay by card?','Pay by card signifie payer par carte.'],
['shop','Rupture','Cet article est-il encore disponible ?','Is this item still available?','Still signifie encore lorsqu’une situation continue.'],
['food','Restaurant','Je voudrais le poulet avec des légumes.','I would like the chicken with vegetables.','I would like est une façon polie de commander au restaurant.'],
['food','Allergie','Je suis allergique aux cacahuètes.','I am allergic to peanuts.','Be allergic to plus un aliment signifie être allergique à cet aliment.'],
['food','Addition','Puis-je avoir l’addition, s’il vous plaît ?','Can I have the bill, please?','Bill signifie l’addition en anglais britannique.'],
['food','Cuisson','Je voudrais mon steak à point.','I would like my steak medium, please.','Medium correspond généralement à une cuisson à point.'],
['food','Réservation','Nous avons une réservation pour quatre personnes.','We have a reservation for four people.','For four people indique le nombre de personnes de la réservation.'],
['admin','Mairie','Je voudrais renouveler ce document.','I would like to renew this document.','Renew signifie renouveler.'],
['admin','Formulaire','Où dois-je signer ce formulaire ?','Where should I sign this form?','Where should I plus un verbe sert à demander où il faut effectuer une action.'],
['admin','Dossier','Il manque un document dans mon dossier.','A document is missing from my file.','Is missing signifie manque. File peut désigner un dossier administratif.'],
['admin','Attente','Depuis combien de temps attendez-vous ?','How long have you been waiting?','How long avec le present perfect continuous permet de demander une durée commencée dans le passé.'],
['admin','Justificatif','J’ai apporté un justificatif de domicile.','I brought proof of address.','Proof of address signifie justificatif de domicile.'],
['money','Banque','Je voudrais vérifier le solde de mon compte.','I would like to check my account balance.','Account balance signifie solde du compte.'],
['money','Carte bancaire','Ma carte a été refusée.','My card was declined.','Was declined est la forme naturelle pour dire qu’une carte bancaire a été refusée.'],
['money','Virement','Le virement arrivera demain.','The bank transfer will arrive tomorrow.','Bank transfer signifie virement bancaire.'],
['money','Budget','Je dois réduire mes dépenses ce mois-ci.','I need to reduce my expenses this month.','Reduce expenses signifie réduire les dépenses.'],
['money','Facture','Cette facture est plus élevée que prévu.','This bill is higher than expected.','Higher than signifie plus élevé que. Expected signifie prévu.'],
['family','Enfants','Les enfants jouent dans leur chambre.','The children are playing in their room.','Are playing décrit une action en cours. Children est le pluriel irrégulier de child.'],
['family','École','Mon fils commence l’école à huit heures trente.','My son starts school at eight thirty.','Starts prend un s avec my son car le sujet est à la troisième personne du singulier.'],
['family','Devoirs','Il doit finir ses devoirs avant de jouer.','He has to finish his homework before playing.','Has to signifie doit. Homework est indénombrable.'],
['family','Week-end','Nous allons voir la famille ce week-end.','We are going to see the family this weekend.','Be going to exprime un projet déjà prévu.'],
['family','Sport','Il a entraînement de football ce soir.','He has football practice tonight.','Football practice signifie entraînement de football.']
];

const programs=TOPICS.map((t,i)=>({id:i,cat:t[0],title:t[1],fr:t[2],en:t[3],why:t[4]}));
const store=LearningStore,audio=LearningAudio;
const cats={daily:'Vie quotidienne',home:'Maison & cuisine',road:'Route & transport',work:'Travail',travel:'Voyage',people:'Relations',health:'Santé',shop:'Achats',food:'Restaurant',admin:'Administration',money:'Argent & banque',family:'Famille'};
let queue=[],idx=0,stage=0,playing=false,elapsed=0,startedAt=0,sessionMinutes=10,token=0,completed=false;
function shuffled(a){const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}
function spent(){return elapsed+(playing?Date.now()-startedAt:0);}
function save(){if(completed)return;store.saveSession('passive',{queue,idx,stage,elapsed:spent(),minutes:sessionMinutes,theme:$('theme').value});}
function build(){completed=false;queue=shuffled(programs.filter(p=>$('theme').value==='mix'||p.cat===$('theme').value).map(p=>p.id));idx=0;stage=0;elapsed=0;display();}
function display(){const p=programs[queue[idx]];if(!p)return;$('fr').textContent=p.fr;$('en').textContent=p.en;$('why').textContent=p.why;}
function pause(message='En pause. Reprends au même passage.'){if(playing)elapsed=spent();playing=false;token++;audio.stop();$('play').textContent='▶ Reprendre';$('status').textContent=message;save();}
async function run(myToken){
 while(playing&&myToken===token){
  if(spent()>=sessionMinutes*60000){pause('Séance terminée. Bravo pour cette écoute !');completed=true;store.clearSession('passive');$('play').textContent='▶ Nouvelle écoute';elapsed=0;return;}
  if(idx>=queue.length){queue=shuffled(queue);idx=0;}
  const p=programs[queue[idx]];display();
  const steps=[[p.fr,.9,'fr-FR'],[p.en,.74,'en-US'],[p.why,.9,'fr-FR'],[p.en,.62,'en-US']];
  const labels=['Français','Anglais','Explication','Répétition lente'];
  $('status').textContent=`${p.title} • ${labels[stage]} • ${Math.floor(spent()/60000)}/${sessionMinutes} min`;
  const result=await audio.speak(...steps[stage]);
  if(!playing||myToken!==token)return;
  if(result!=='done'){pause('Voix indisponible ou interrompue. Vérifie les réglages, puis reprends.');return;}
  stage++;if(stage===steps.length){stage=0;idx++;}save();
 }
}
function play(){if(playing)return;if(completed)build();if(!queue.length)build();playing=true;startedAt=Date.now();$('play').textContent='▶ En lecture';const id=++token;run(id);}
$('play').onclick=play;$('pause').onclick=()=>pause();
$('next').onclick=()=>{const resume=playing;pause();idx=(idx+1)%queue.length;stage=0;display();save();if(resume)play();};
$('restart').onclick=()=>{pause();build();save();play();};
$('theme').onchange=()=>{pause();build();save();$('status').textContent='Thème choisi. Appuie sur Lecture.';};
$('duration').onchange=()=>{sessionMinutes=Number($('duration').value)||10;save();};
Object.entries(cats).forEach(([v,n])=>{const o=document.createElement('option');o.value=v;o.textContent=n;$('theme').appendChild(o);});
$('programTotal').textContent=programs.length;
const saved=store.getSession('passive');
if(saved&&Array.isArray(saved.queue)&&saved.queue.length&&saved.queue.every(id=>Number.isInteger(id)&&programs[id])){queue=saved.queue;idx=Math.max(0,Number(saved.idx)||0)%queue.length;stage=Math.max(0,Math.min(3,Number(saved.stage)||0));elapsed=Math.max(0,Number(saved.elapsed)||0);sessionMinutes=[5,10,15,30,45,60].includes(saved.minutes)?saved.minutes:10;$('theme').value=cats[saved.theme]?saved.theme:'mix';$('duration').value=String(sessionMinutes);$('play').textContent='▶ Reprendre';$('status').textContent='Ta séance est sauvegardée. Appuie sur Reprendre.';display();}else build();
window.addEventListener('pagehide',()=>pause());window.addEventListener('learning-interrupted',()=>pause('Séance sauvegardée. Reviens ici pour reprendre.'));
})();
