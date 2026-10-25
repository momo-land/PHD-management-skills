import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {delimiter,join} from 'node:path';
import {findCodexExecutable} from '../lib/assistant-bridge.mjs';

function fixture(t){
  const root=mkdtempSync(join(tmpdir(),'phd-cli-selection-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  const binary=dir=>{mkdirSync(dir,{recursive:true});const path=join(dir,process.platform==='win32'?'codex.exe':'codex');writeFileSync(path,'fixture executable',{mode:0o755});return path;};
  return {root,binary};
}

test('explicit absolute Codex choice takes precedence and an invalid choice does not fall back',t=>{
  const {root,binary}=fixture(t),ordinary=binary(join(root,'ordinary')),chosen=binary(join(root,'chosen'));
  const env={PATH:join(root,'ordinary'),PHD_CODEX_PATH:chosen};
  assert.equal(findCodexExecutable(env),chosen);
  assert.equal(findCodexExecutable({...env,PHD_CODEX_PATH:join(root,'missing.exe')}),null);
  assert.equal(findCodexExecutable({...env,PHD_CODEX_PATH:'relative-codex.exe'}),null);
  assert.equal(findCodexExecutable({PATH:join(root,'ordinary')}),ordinary);
});

test('Windows desktop history uses the desktop CLI advertised later in PATH',{skip:process.platform!=='win32'},t=>{
  const {root,binary}=fixture(t),standaloneDir=join(root,'Programs','OpenAI','CodexCLI'),desktopDir=join(root,'OpenAI','Codex','bin','existing-build');
  binary(standaloneDir);const desktop=binary(desktopDir);
  assert.equal(findCodexExecutable({LOCALAPPDATA:root,PATH:[standaloneDir,desktopDir].join(delimiter)}),desktop);
});

test('a missing desktop candidate preserves the available standalone fallback',{skip:process.platform!=='win32'},t=>{
  const {root,binary}=fixture(t),standaloneDir=join(root,'Programs','OpenAI','CodexCLI'),desktopDir=join(root,'OpenAI','Codex','bin','removed-build');
  const standalone=binary(standaloneDir);
  assert.equal(findCodexExecutable({LOCALAPPDATA:root,PATH:[standaloneDir,desktopDir].join(delimiter)}),standalone);
});

test('an explicit standalone choice overrides desktop preference',{skip:process.platform!=='win32'},t=>{
  const {root,binary}=fixture(t),standaloneDir=join(root,'standalone'),desktopDir=join(root,'OpenAI','Codex','bin','existing-build');
  const standalone=binary(standaloneDir);binary(desktopDir);
  assert.equal(findCodexExecutable({LOCALAPPDATA:root,PATH:[standaloneDir,desktopDir].join(delimiter),PHD_CODEX_PATH:standalone}),standalone);
});

const macCodex='/Applications/Codex.app/Contents/Resources/codex';
const macChatGPT='/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex';
const installed=(platform,paths)=>({platform,available:path=>paths.includes(path)});

test('macOS prefers the Codex app CLI over an older Homebrew/PATH CLI',()=>{
  const env={PATH:'/opt/homebrew/bin:/usr/local/bin'};
  assert.equal(findCodexExecutable(env,installed('darwin',[macCodex,'/opt/homebrew/bin/codex'])),macCodex);
});

test('macOS retains the ChatGPT app CLI fallback when Codex.app is absent',()=>{
  assert.equal(findCodexExecutable({PATH:'/usr/local/bin'},installed('darwin',[macChatGPT,'/usr/local/bin/codex'])),macChatGPT);
});

test('macOS falls back to PATH when neither desktop application is installed',()=>{
  assert.equal(findCodexExecutable({PATH:'/opt/homebrew/bin:/usr/local/bin'},installed('darwin',['/usr/local/bin/codex'])),'/usr/local/bin/codex');
  assert.equal(findCodexExecutable({PATH:'/opt/homebrew/bin'},installed('darwin',[])),null);
});

test('macOS explicit paths, including spaces, override desktop discovery without silent fallback',()=>{
  const chosen='/Users/researcher/Custom Tools/codex';
  const options=installed('darwin',[chosen,macCodex]);
  assert.equal(findCodexExecutable({PATH:'/usr/local/bin',PHD_CODEX_PATH:chosen},options),chosen);
  assert.equal(findCodexExecutable({PHD_CODEX_PATH:'/missing/codex'},options),null);
  assert.equal(findCodexExecutable({PHD_CODEX_PATH:'relative/codex'},options),null);
});

test('Windows desktop preference is testable on every host and uses Windows path semantics',()=>{
  const local='C:\\Users\\researcher\\AppData\\Local';
  const old='C:\\CLI\\codex.exe',desktop=local+'\\OpenAI\\Codex\\bin\\build\\codex.exe';
  assert.equal(findCodexExecutable({LOCALAPPDATA:local,PATH:'C:\\CLI;'+local+'\\OpenAI\\Codex\\bin\\build'},installed('win32',[old,desktop])),desktop);
});

test('Linux keeps PATH order and never selects macOS app bundles',()=>{
  assert.equal(findCodexExecutable({PATH:'/usr/local/bin:/usr/bin'},installed('linux',[macCodex,'/usr/bin/codex'])),'/usr/bin/codex');
  assert.equal(findCodexExecutable({PATH:'/usr/bin'},installed('linux',[macCodex])),null);
});
