const {readdirSync}=require('node:fs');const {execFileSync}=require('node:child_process');
for(const file of readdirSync('.').filter(x=>x.endsWith('.js')))execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
