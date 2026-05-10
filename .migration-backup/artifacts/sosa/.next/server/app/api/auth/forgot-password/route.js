"use strict";(()=>{var e={};e.id=9118,e.ids=[9118],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},8678:e=>{e.exports=import("pg")},28291:(e,t,r)=>{r.a(e,async(e,o)=>{try{r.r(t),r.d(t,{originalPathname:()=>h,patchFetch:()=>c,requestAsyncStorage:()=>p,routeModule:()=>d,serverHooks:()=>f,staticGenerationAsyncStorage:()=>u});var i=r(7849),s=r(94966),a=r(79169),n=r(6402),l=e([n]);n=(l.then?(await l)():l)[0];let d=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/auth/forgot-password/route",pathname:"/api/auth/forgot-password",filename:"route",bundlePath:"app/api/auth/forgot-password/route"},resolvedPagePath:"/home/runner/workspace/artifacts/sosa/app/api/auth/forgot-password/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:p,staticGenerationAsyncStorage:u,serverHooks:f}=d,h="/api/auth/forgot-password/route";function c(){return(0,a.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:u})}o()}catch(e){o(e)}})},6402:(e,t,r)=>{r.a(e,async(e,o)=>{try{r.r(t),r.d(t,{POST:()=>c,dynamic:()=>d});var i=r(1237),s=r(38058),a=r(73067),n=r(84770),l=e([s]);s=(l.then?(await l)():l)[0];let d="force-dynamic";async function c(e){try{let{email:t}=await e.json();if(!t)return i.NextResponse.json({error:"Email is required"},{status:400});let r=await (0,s.CX)(t);if(!r)return i.NextResponse.json({message:"If that email exists, a reset link has been sent."});let o=(0,n.randomUUID)(),l=new Date(Date.now()+36e5).toISOString();return await (0,s.Nq)(r.id,{passwordResetToken:o,passwordResetExpires:l}),(0,a.LS)(r.email,r.name,o,function(e){let t=e.headers.get("x-forwarded-proto")||"https",r=e.headers.get("x-forwarded-host")||e.headers.get("host")||"localhost:5000";return`${t}://${r}`}(e)).catch(()=>{}),i.NextResponse.json({message:"If that email exists, a reset link has been sent."})}catch(e){return console.error("Forgot password error:",e),i.NextResponse.json({error:"Internal server error"},{status:500})}}o()}catch(e){o(e)}})},73067:(e,t,r)=>{r.d(t,{L5:()=>c,LS:()=>p,Pi:()=>u,zk:()=>d});var o=r(34449);let i="Sosa",s=null;async function a(e,t=3){let r;for(let a=1;a<=t;a++){let n=function(){if(s)return s;let e=process.env.GMAIL_USER,t=process.env.GMAIL_APP_PASSWORD;return e&&t?((s=o.createTransport({host:"smtp.gmail.com",port:465,secure:!0,auth:{user:e,pass:t},socketTimeout:1e4,greetingTimeout:1e4,connectionTimeout:1e4})).verify().then(()=>{console.log("[email] SMTP connection OK")}).catch(e=>{console.error("[email] SMTP verify failed:",e.message),s=null}),s):(console.error("[email] GMAIL_USER or GMAIL_APP_PASSWORD env vars are missing"),null)}();if(!n)throw Error("Email service is not configured. Please contact the administrator.");try{let t=await n.sendMail({...e,from:`${i} <${process.env.GMAIL_USER}>`});console.log(`[email] Sent "${e.subject}" to ${e.to} — ${t.messageId}`);return}catch(o){r=o,console.error(`[email] Attempt ${a}/${t} failed:`,o.message),s=null;let e=o?.responseCode||0;if(550===e||553===e||535===e||o?.code==="EAUTH")break;a<t&&await new Promise(e=>setTimeout(e,1500*a))}}throw Error(function(e){let t=(e?.message||"").toLowerCase(),r=e?.code||"",o=e?.responseCode||0;return process.env.GMAIL_USER&&process.env.GMAIL_APP_PASSWORD?"EAUTH"===r||535===o||t.includes("invalid credentials")||t.includes("username and password")?"Email service credentials are incorrect. Please contact the administrator.":550===o||553===o||t.includes("does not exist")||t.includes("no such user")||t.includes("invalid address")||t.includes("bad destination")?"That email address doesn't exist or cannot receive mail. Please check and try again.":421===o||450===o||t.includes("daily sending quota")||t.includes("rate limit")||t.includes("too many")?"Email sending limit reached. Please try again later.":"ECONNECTION"===r||"ETIMEDOUT"===r||"ESOCKET"===r||t.includes("connect")||t.includes("timeout")?"Could not connect to the email server. Please try again in a moment.":552===o||t.includes("message too large")?"The email is too large to send.":"Failed to send email. Please try again later.":"Email service is not configured. Please contact the administrator."}(r))}function n(e){return`<!DOCTYPE html>
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
          <p style="margin:0 0 6px;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">${i}</p>
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
  </table>`}async function c(e,t,r){let o=n(`
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
  `),s=`Hi ${t},

Your ${i} verification code is:

${r}

Expires in 30 minutes. Do not share it.

– ${i}`;await a({to:e,subject:`${r} — your ${i} verification code`,html:o,text:s,headers:{"X-Priority":"1","X-Mailer":i}})}async function d(e,t,r,o){let s=`${o}/api/auth/verify?token=${r}`,c=n(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Verify your email address</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, please confirm your email to activate your ${i} account.</p>
    ${l(s,"Verify Email Address")}
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">Link expires in 24 hours.<br/><span style="color:#888;word-break:break-all;">${s}</span></p>
  `),d=`Hi ${t},

Verify your ${i} account:
${s}

Expires in 24 hours.

– ${i}`;await a({to:e,subject:`Confirm your ${i} email address`,html:c,text:d,headers:{"X-Priority":"3","X-Mailer":i,"List-Unsubscribe":`<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`}})}async function p(e,t,r,o){let s=`${o}/reset-password?token=${r}`,c=n(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Reset your password</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, click below to choose a new password. This link expires in 1 hour.</p>
    ${l(s,"Reset Password")}
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">If you did not request a reset, ignore this email.</p>
  `),d=`Hi ${t},

Reset your ${i} password:
${s}

Expires in 1 hour.

– ${i}`;await a({to:e,subject:`Reset your ${i} password`,html:c,text:d,headers:{"X-Priority":"1","X-Mailer":i,"List-Unsubscribe":`<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`}})}async function u(e,t,r){let o=n(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Welcome to ${i}!</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, your account is active. Connect with fellow law students and stay updated with the community.</p>
    ${l(`${r}/dashboard`,"Go to your feed →")}
  `),s=`Hi ${t},

Welcome to ${i}!

Visit your feed: ${r}/dashboard

– ${i}`;await a({to:e,subject:`Welcome to ${i}`,html:o,text:s,headers:{"X-Priority":"3","X-Mailer":i,"List-Unsubscribe":`<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`}})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[3867,5444,4449,8058],()=>r(28291));module.exports=o})();