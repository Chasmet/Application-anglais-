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
const levels=[['A2','simple et directe'],['A2+','plus naturelle'],['B1','avec davantage de contexte'],['B1+','avec nuance et vocabulaire plus riche']];
const programs=[];
TOPICS.forEach((t,ti)=>levels.forEach((l,li)=>programs.push({id:`p${ti}-${li}`,cat:t[0],title:`${t[1]} • ${l[0]}`,level:l[0],fr:t[2],en:t[3],why:t[4],hint:l[1]})));
let queue=[],idx=0,playing=false,started=0,sessionMinutes=30,transitionToken=0;
const cats={mix:'Tous les thèmes',daily:'Vie quotidienne',home:'Maison & cuisine',road:'Route & transport',work:'Travail',travel:'Voyage',people:'Relations',health:'Santé',shop:'Achats',food:'Restaurant',admin:'Administration',money:'Argent & banque',family:'Famille'};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,Math.min(1500,Math.max(0,ms))));
function shuffled(a){return [...a].sort(()=>Math.random()-.5)}
function build(){const cat=$('theme').value;const src=cat==='mix'?programs:programs.filter(p=>p.cat===cat);queue=shuffled(src.length?src:programs);idx=0;$('programTotal').textContent=programs.length}
function webSpeak(text,rate,lang,resolve){if(!('speechSynthesis'in window))return false;const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate;u.pitch=lang.startsWith('fr')?.98:1;u.onend=resolve;u.onerror=resolve;speechSynthesis.cancel();speechSynthesis.speak(u);return true}
function nativeSpeak(text,rate,lang){return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;resolve()};window.onNativeTtsFinished=finish;try{if(window.AndroidTTS&&AndroidTTS.speakWithLanguage){AndroidTTS.speakWithLanguage(text,rate,lang);setTimeout(finish,Math.max(2600,text.length*90));return}if(window.AndroidTTS&&AndroidTTS.speak){AndroidTTS.speak(text,rate);setTimeout(finish,Math.max(2600,text.length*90));return}}catch(e){}if(webSpeak(text,rate,lang,finish))return;setTimeout(finish,1200)})}
async function say(text,rate,lang){if(!playing)return false;await nativeSpeak(text,rate,lang);return playing}
function preloadEnglish(text,rate){try{if(window.AndroidTTS&&AndroidTTS.preload)AndroidTTS.preload(text,rate)}catch(e){}}
async function runLesson(){
 if(!playing)return;
 const myToken=++transitionToken;
 if(Date.now()-started>=sessionMinutes*60000){playing=false;$('status').textContent=`Session de ${sessionMinutes} minutes terminée.`;return}
 if(idx>=queue.length){queue=shuffled(queue);idx=0}
 const p=queue[idx++];
 $('fr').textContent=p.fr;$('en').textContent=p.en;$('why').textContent=p.why;
 $('status').textContent=`${p.title} • ${Math.floor((Date.now()-started)/60000)+1}/${sessionMinutes} min`;

 // Précharge Kokoro pendant que la voix française parle afin d'éviter un blanc avant l'anglais.
 preloadEnglish(p.en,.62);
 if(!await say(p.fr,.88,'fr-FR')||myToken!==transitionToken)return;
 await wait(650);
 if(!await say(p.en,.62,'en-US')||myToken!==transitionToken)return;
 await wait(850);
 if(!await say('Pourquoi ? '+p.why,.86,'fr-FR')||myToken!==transitionToken)return;
 await wait(700);
 if(!await say('Écoute encore une fois.',.86,'fr-FR')||myToken!==transitionToken)return;
 await wait(450);
 preloadEnglish(p.en,.58);
 if(!await say(p.en,.58,'en-US')||myToken!==transitionToken)return;
 if(playing&&myToken===transitionToken)setTimeout(runLesson,900)
}
$('play').onclick=()=>{if(!playing){playing=true;started=Date.now();build();runLesson()}};
$('pause').onclick=()=>{playing=false;transitionToken++;try{speechSynthesis.cancel()}catch(e){}$('status').textContent='En pause.'};
$('next').onclick=()=>{transitionToken++;if(!playing){playing=true;started=started||Date.now()}runLesson()};
$('theme').onchange=build;
$('duration').onchange=()=>sessionMinutes=Number($('duration').value)||30;
Object.entries(cats).forEach(([v,n])=>{if(v==='mix')return;const o=document.createElement('option');o.value=v;o.textContent=n;$('theme').appendChild(o)});
$('programTotal').textContent=programs.length;
build();
})();