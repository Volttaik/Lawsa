"use strict";(()=>{var e={};e.id=6822,e.ids=[6822],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},8678:e=>{e.exports=import("pg")},56749:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{originalPathname:()=>m,patchFetch:()=>c,requestAsyncStorage:()=>p,routeModule:()=>d,serverHooks:()=>f,staticGenerationAsyncStorage:()=>u});var o=r(7849),a=r(94966),s=r(79169),n=r(1206),l=e([n]);n=(l.then?(await l)():l)[0];let d=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/auth/resend-code/route",pathname:"/api/auth/resend-code",filename:"route",bundlePath:"app/api/auth/resend-code/route"},resolvedPagePath:"/home/runner/workspace/artifacts/sosa/app/api/auth/resend-code/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:p,staticGenerationAsyncStorage:u,serverHooks:f}=d,m="/api/auth/resend-code/route";function c(){return(0,s.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:u})}i()}catch(e){i(e)}})},1206:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{POST:()=>d,dynamic:()=>p});var o=r(1237),a=r(38058),s=r(73067),n=r(34600),l=r.n(n),c=e([a]);a=(c.then?(await c)():c)[0];let p="force-dynamic";async function d(e){try{let{emailOrUsername:t,password:r}=await e.json();if(!t||!r)return o.NextResponse.json({error:"Credentials required"},{status:400});let i=await (0,a.Cn)(t);if(!i||!await l().compare(r,i.password))return o.NextResponse.json({error:"Invalid credentials"},{status:401});if(i.emailVerified)return o.NextResponse.json({message:"Already verified."});let n=String(Math.floor(1e5+9e5*Math.random())),c=new Date(Date.now()+18e5).toISOString();await (0,a.Nq)(i.id,{emailVerificationCode:n,emailVerificationCodeExpires:c});try{await (0,s.L5)(i.email,i.name,n)}catch(e){return o.NextResponse.json({error:e.message||"Failed to send code. Please try again."},{status:500})}return o.NextResponse.json({message:"Code sent."})}catch(e){return console.error("Resend code error:",e),o.NextResponse.json({error:"Failed to send code. Please try again."},{status:500})}}i()}catch(e){i(e)}})},73067:(e,t,r)=>{r.d(t,{L5:()=>c,LS:()=>p,Pi:()=>u,zk:()=>d});var i=r(34449);let o="Sosa",a=null;async function s(e,t=3){let r;for(let s=1;s<=t;s++){let n=function(){if(a)return a;let e=process.env.GMAIL_USER,t=process.env.GMAIL_APP_PASSWORD;return e&&t?((a=i.createTransport({host:"smtp.gmail.com",port:465,secure:!0,auth:{user:e,pass:t},socketTimeout:1e4,greetingTimeout:1e4,connectionTimeout:1e4})).verify().then(()=>{console.log("[email] SMTP connection OK")}).catch(e=>{console.error("[email] SMTP verify failed:",e.message),a=null}),a):(console.error("[email] GMAIL_USER or GMAIL_APP_PASSWORD env vars are missing"),null)}();if(!n)throw Error("Email service is not configured. Please contact the administrator.");try{let t=await n.sendMail({...e,from:`${o} <${process.env.GMAIL_USER}>`});console.log(`[email] Sent "${e.subject}" to ${e.to} — ${t.messageId}`);return}catch(i){r=i,console.error(`[email] Attempt ${s}/${t} failed:`,i.message),a=null;let e=i?.responseCode||0;if(550===e||553===e||535===e||i?.code==="EAUTH")break;s<t&&await new Promise(e=>setTimeout(e,1500*s))}}throw Error(function(e){let t=(e?.message||"").toLowerCase(),r=e?.code||"",i=e?.responseCode||0;return process.env.GMAIL_USER&&process.env.GMAIL_APP_PASSWORD?"EAUTH"===r||535===i||t.includes("invalid credentials")||t.includes("username and password")?"Email service credentials are incorrect. Please contact the administrator.":550===i||553===i||t.includes("does not exist")||t.includes("no such user")||t.includes("invalid address")||t.includes("bad destination")?"That email address doesn't exist or cannot receive mail. Please check and try again.":421===i||450===i||t.includes("daily sending quota")||t.includes("rate limit")||t.includes("too many")?"Email sending limit reached. Please try again later.":"ECONNECTION"===r||"ETIMEDOUT"===r||"ESOCKET"===r||t.includes("connect")||t.includes("timeout")?"Could not connect to the email server. Please try again in a moment.":552===i||t.includes("message too large")?"The email is too large to send.":"Failed to send email. Please try again later.":"Email service is not configured. Please contact the administrator."}(r))}function n(e){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#111;border-radius:16px;border:1px solid #222;overflow:hidden;">
        <tr><td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid #1e1e1e;">
          <p style="margin:0 0 6px;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">${o}</p>
          <p style="margin:0;font-size:11px;color:#555;">Connect, Share & Grow with your community</p>
        </td></tr>
        <tr><td style="padding:32px;">${e}</td></tr>
        <tr><td style="padding:14px 32px 22px;border-top:1px solid #1e1e1e;text-align:center;">
          <p style="margin:0;font-size:11px;color:#444;">If you did not request this, you can safely ignore it.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`}function l(e,t){return`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr><td align="center">
      <a href="${e}" style="display:inline-block;background:#fff;color:#000;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:100px;font-size:15px;">${t}</a>
    </td></tr>
  </table>`}async function c(e,t,r){let i=n(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Your verification code</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, enter this code to verify your identity. It expires in <strong style="color:#fff;">30 minutes</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td align="center">
        <div style="display:inline-block;background:#1a1a1a;border:2px solid #333;border-radius:16px;padding:20px 40px;">
          <span style="font-size:40px;font-weight:900;color:#ffffff;letter-spacing:12px;font-family:monospace;">${r}</span>
        </div>
      </td></tr>
    </table>
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">Do not share this code with anyone.</p>
  `),a=`Hi ${t},

Your ${o} verification code is:

${r}

Expires in 30 minutes. Do not share it.

– ${o}`;await s({to:e,subject:`${r} — your ${o} verification code`,html:i,text:a,headers:{"X-Priority":"1","X-Mailer":o}})}async function d(e,t,r,i){let a=`${i}/api/auth/verify?token=${r}`,c=n(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Verify your email address</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, please confirm your email to activate your ${o} account.</p>
    ${l(a,"Verify Email Address")}
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">Link expires in 24 hours.<br/><span style="color:#888;word-break:break-all;">${a}</span></p>
  `),d=`Hi ${t},

Verify your ${o} account:
${a}

Expires in 24 hours.

– ${o}`;await s({to:e,subject:`Confirm your ${o} email address`,html:c,text:d,headers:{"X-Priority":"3","X-Mailer":o,"List-Unsubscribe":`<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`}})}async function p(e,t,r,i){let a=`${i}/reset-password?token=${r}`,c=n(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Reset your password</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, click below to choose a new password. This link expires in 1 hour.</p>
    ${l(a,"Reset Password")}
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">If you did not request a reset, ignore this email.</p>
  `),d=`Hi ${t},

Reset your ${o} password:
${a}

Expires in 1 hour.

– ${o}`;await s({to:e,subject:`Reset your ${o} password`,html:c,text:d,headers:{"X-Priority":"1","X-Mailer":o,"List-Unsubscribe":`<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`}})}async function u(e,t,r){let i=n(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Welcome to ${o}!</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, your account is active. Connect with fellow law students and stay updated with the community.</p>
    ${l(`${r}/dashboard`,"Go to your feed →")}
  `),a=`Hi ${t},

Welcome to ${o}!

Visit your feed: ${r}/dashboard

– ${o}`;await s({to:e,subject:`Welcome to ${o}`,html:i,text:a,headers:{"X-Priority":"3","X-Mailer":o,"List-Unsubscribe":`<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`}})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[3867,5444,4449,4600,8058],()=>r(56749));module.exports=i})();