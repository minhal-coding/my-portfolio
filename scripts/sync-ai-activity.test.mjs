import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

async function fixture(t, {isPrivate = false, newer = false, total = "10"} = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "portfolio-activity-test-"));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith("portfolio-activity-test-"));
    await rm(root, {recursive:true, force:true});
  });
  await mkdir(path.join(root,"scripts"));
  await mkdir(path.join(root,"data"));
  await copyFile(new URL("./sync-ai-activity.mjs", import.meta.url), path.join(root,"scripts/sync-ai-activity.mjs"));
  const data = {generatedAt:"2026-01-01T00:00:00Z",growthAI:{repository:"example/public",repositoryUrl:"https://github.com/example/public",latestUpdate:{timestamp:"2026-01-01T00:00:00Z"},recentUpdates:[]},tokens:{total:10,updatedAt:"2026-01-01T00:00:00Z",sourceLabel:"Owner-maintained Codex usage estimate"}};
  const file = path.join(root,"data/ai-activity.json");
  const initial = JSON.stringify(data,null,2)+"\n";
  await writeFile(file,initial);
  const mock = `globalThis.fetch = async (url) => ({ok:true,json:async()=>url.includes('/commits?') ? ${JSON.stringify(newer ? [{commit:{message:"Implement useful feature",committer:{date:"2026-02-01T00:00:00Z"}},html_url:"https://github.com/example/public/commit/abcdef1",sha:"abcdef12345"}] : [])} : {private:${isPrivate},html_url:"https://github.com/example/public"}});`;
  const mockFile=path.join(root,"mock.mjs");
  await writeFile(mockFile,mock);
  const run=()=>execFileSync(process.execPath,["--import",pathToFileURL(mockFile).href,path.join(root,"scripts/sync-ai-activity.mjs")],{encoding:"utf8",env:{...process.env,GROWTH_AI_REPOSITORY:"example/public",CODEX_TOKEN_TOTAL:total,GH_TOKEN:"",GITHUB_TOKEN:""},stdio:"pipe"});
  return {run,file,initial};
}

test("unchanged public activity and same token estimate do not touch the snapshot",async(t)=>{
  const f=await fixture(t); f.run(); assert.equal(await readFile(f.file,"utf8"),f.initial);
});
test("new public activity updates once, subsequent check is a no-op",async(t)=>{
  const f=await fixture(t,{newer:true}); f.run(); const changed=await readFile(f.file,"utf8");
  assert.equal(JSON.parse(changed).growthAI.latestUpdate.title,"Implement useful feature");
  f.run(); assert.equal(await readFile(f.file,"utf8"),changed);
});
test("changed owner estimate updates once without manufacturing ongoing changes",async(t)=>{
  const f=await fixture(t,{total:"11"}); f.run(); const changed=await readFile(f.file,"utf8");
  assert.equal(JSON.parse(changed).tokens.total,11); f.run(); assert.equal(await readFile(f.file,"utf8"),changed);
});
test("private repository metadata is never published",async(t)=>{
  const f=await fixture(t,{isPrivate:true,newer:true}); assert.throws(f.run, /verified public repositories/);
  assert.equal(await readFile(f.file,"utf8"),f.initial);
});
