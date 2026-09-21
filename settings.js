(() => {
'use strict';
const $=id=>document.getElementById(id),store=LearningStore;let latestUrl='',latestVersion='',pendingBackup='',checkTimer;
const status=message=>$('updateStatus').textContent=message;
const native=window.AndroidUpdater;
$('currentVersion').textContent=native?native.getCurrentVersion():'Version web';
$('checkUpdate').disabled=!native;$('autoUpdate').disabled=!native;
if(native)$('autoUpdate').checked=native.isAutoCheckEnabled();else status('La version web se met à jour lors du rechargement.');
$('autoUpdate').onchange=()=>native?.setAutoCheckEnabled($('autoUpdate').checked);
$('checkUpdate').onclick=()=>{if(!native)return;status('Recherche de la dernière version…');$('checkUpdate').disabled=true;$('downloadUpdate').hidden=true;clearTimeout(checkTimer);checkTimer=setTimeout(()=>window.onUpdateError('Le serveur ne répond pas. Réessaie plus tard.'),18000);try{native.checkLatest();}catch(_){window.onUpdateError('Vérification indisponible.');}};
$('downloadUpdate').onclick=()=>{if(!native||!latestUrl)return;$('downloadUpdate').disabled=true;status('Téléchargement en cours…');try{native.downloadAndInstall(latestUrl,latestVersion);}catch(_){window.onUpdateError('Téléchargement indisponible.');}};
window.onUpdateCheck=(available,version,url,message)=>{clearTimeout(checkTimer);$('checkUpdate').disabled=false;latestVersion=version;latestUrl=url;status(message);$('downloadUpdate').hidden=!available;$('downloadUpdate').disabled=false;$('downloadUpdate').textContent=`Installer la version ${version}`;};
window.onUpdateProgress=(percent,message)=>{$('progress').style.width=Math.min(100,Math.max(0,Number(percent)||0))+'%';status(message);};
window.onUpdateError=message=>{clearTimeout(checkTimer);status(message);$('checkUpdate').disabled=!native;$('downloadUpdate').disabled=false;};
window.onUpdateReady=message=>{$('downloadUpdate').disabled=false;status(message);};
function voices(){try{$('voiceName').textContent=window.AndroidTTS?`${AndroidTTS.getVoiceName()} • Français : ${AndroidTTS.getFrenchVoiceName()}`:'Voix disponibles sur ce navigateur';}catch(_){$('voiceName').textContent='Voix en cours de préparation';}}
$('voiceEngine').value=window.AndroidTTS?.getEngine?.()||'fast';$('voiceEngine').disabled=!window.AndroidTTS?.setEngine;
$('voiceEngine').onchange=()=>{LearningAudio.stop();AndroidTTS.setEngine($('voiceEngine').value);voices();};
$('testVoice').onclick=()=>LearningAudio.speak('Hello. Let us practise English together.',.72);
$('stopVoice').onclick=()=>LearningAudio.stop();
window.addEventListener('learning-audio-state',e=>{$('audioStatus').textContent=({preparing:'Préparation…',speaking:'Lecture en cours',idle:'Prêt',error:'Voix indisponible. Vérifie les voix installées.'})[e.detail.state];voices();});
$('textSize').value=store.read('learning_text_size','normal');$('textSize').onchange=()=>{store.write('learning_text_size',$('textSize').value);document.documentElement.dataset.textSize=$('textSize').value;};
window.onBackupStatus=message=>$('backupStatus').textContent=message;
function exportBackup(){const text=store.exportData();if(window.AndroidBackup?.exportData){AndroidBackup.exportData(text);return;}const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='AnglaisPlus-sauvegarde.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);window.onBackupStatus('Sauvegarde prête dans les téléchargements.');}
$('exportBackup').onclick=exportBackup;
window.onBackupLoaded=text=>{try{const backup=store.validateBackup(text);pendingBackup=text;$('restoreBackup').hidden=false;$('backupStatus').textContent=`Sauvegarde reconnue : ${Object.keys(backup.entries).length} éléments. Enregistre d’abord une copie de tes progrès actuels, puis confirme la restauration.`;}catch(e){pendingBackup='';$('restoreBackup').hidden=true;window.onBackupStatus(e.message||'Fichier invalide.');}};
$('importBackup').onclick=()=>{if(window.AndroidBackup?.importData)AndroidBackup.importData();else $('backupFile').click();};
$('backupFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>4000000){window.onBackupStatus('Fichier trop volumineux.');return;}try{window.onBackupLoaded(await file.text());}catch(_){window.onBackupStatus('Impossible de lire le fichier.');}e.target.value='';};
$('restoreBackup').onclick=()=>{try{const count=store.importData(pendingBackup);pendingBackup='';$('restoreBackup').hidden=true;window.onBackupStatus(`${count} éléments restaurés. Retourne à l’accueil pour reprendre.`);}catch(e){window.onBackupStatus(e.message);}};
window.addEventListener('learning-storage-error',()=>window.onBackupStatus('Stockage insuffisant. Exporte tes progrès avant de libérer de la place.'));voices();
})();
