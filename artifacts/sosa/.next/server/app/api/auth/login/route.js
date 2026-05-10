"use strict";(()=>{var e={};e.id=8873,e.ids=[8873],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},8678:e=>{e.exports=import("pg")},72254:e=>{e.exports=require("node:buffer")},6005:e=>{e.exports=require("node:crypto")},47261:e=>{e.exports=require("node:util")},44791:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{originalPathname:()=>m,patchFetch:()=>c,requestAsyncStorage:()=>p,routeModule:()=>d,serverHooks:()=>f,staticGenerationAsyncStorage:()=>u});var o=r(7849),n=r(94966),a=r(79169),s=r(10976),l=e([s]);s=(l.then?(await l)():l)[0];let d=new o.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/auth/login/route",pathname:"/api/auth/login",filename:"route",bundlePath:"app/api/auth/login/route"},resolvedPagePath:"/home/runner/workspace/artifacts/sosa/app/api/auth/login/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:p,staticGenerationAsyncStorage:u,serverHooks:f}=d,m="/api/auth/login/route";function c(){return(0,a.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:u})}i()}catch(e){i(e)}})},10976:(e,t,r)=>{r.a(e,async(e,i)=>{try{r.r(t),r.d(t,{POST:()=>u,dynamic:()=>f});var o=r(1237),n=r(34600),a=r.n(n),s=r(38058),l=r(91123),c=r(73067),d=r(84770),p=e([s]);s=(p.then?(await p)():p)[0];let f="force-dynamic";async function u(e){try{let{emailOrUsername:t,password:r}=await e.json();if(!t||!r)return o.NextResponse.json({error:"All fields are required"},{status:400});let i=await (0,s.Cn)(t);if(!i||!await a().compare(r,i.password))return o.NextResponse.json({error:"Invalid credentials"},{status:401});if(!i.emailVerified){let t=(0,d.randomUUID)(),r=function(e){let t=e.headers.get("x-forwarded-proto")||"https",r=e.headers.get("x-forwarded-host")||e.headers.get("host")||"localhost:5000";return`${t}://${r}`}(e);return(0,s.Nq)(i.id,{emailVerificationToken:t}).then(()=>(0,c.zk)(i.email,i.name,t,r)).catch(e=>console.error("[login] Failed to resend verification email:",e.message)),o.NextResponse.json({error:"Please verify your email before signing in. A new verification link has been sent to your inbox.",requiresVerification:!0},{status:403})}let n=await (0,l.fT)({userId:i.id,email:i.email,username:i.username,name:i.name,profileImage:i.profileImage||""}),{password:p,...u}=i,f=o.NextResponse.json({message:"Login successful",token:n,user:u});return f.cookies.set("lawsa-token",n,{httpOnly:!0,secure:!0,sameSite:"none",maxAge:2592e3,path:"/"}),f}catch(e){return console.error("Login error:",e),o.NextResponse.json({error:"Internal server error"},{status:500})}}i()}catch(e){i(e)}})},91123:(e,t,r)=>{r.d(t,{AY:()=>l,fT:()=>a});var i=r(39178),o=r(49546);let n=new TextEncoder().encode(process.env.JWT_SECRET||"lawsa-socials-secret-key-2024-very-secure");async function a(e){return await new i.N({...e}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(n)}async function s(e){try{let{payload:t}=await (0,o._)(e,n);return t}catch{return null}}async function l(e){let t=e.cookies.get("lawsa-token")?.value;if(!t){let r=e.headers.get("authorization");r?.startsWith("Bearer ")&&(t=r.slice(7))}return t?await s(t):null}},73067:(e,t,r)=>{r.d(t,{L5:()=>c,LS:()=>p,Pi:()=>u,zk:()=>d});var i=r(34449);let o="Sosa",n=null;async function a(e,t=3){let r;for(let a=1;a<=t;a++){let s=function(){if(n)return n;let e=process.env.GMAIL_USER,t=process.env.GMAIL_APP_PASSWORD;return e&&t?((n=i.createTransport({host:"smtp.gmail.com",port:465,secure:!0,auth:{user:e,pass:t},socketTimeout:1e4,greetingTimeout:1e4,connectionTimeout:1e4})).verify().then(()=>{console.log("[email] SMTP connection OK")}).catch(e=>{console.error("[email] SMTP verify failed:",e.message),n=null}),n):(console.error("[email] GMAIL_USER or GMAIL_APP_PASSWORD env vars are missing"),null)}();if(!s)throw Error("Email service is not configured. Please contact the administrator.");try{let t=await s.sendMail({...e,from:`${o} <${process.env.GMAIL_USER}>`});console.log(`[email] Sent "${e.subject}" to ${e.to} — ${t.messageId}`);return}catch(i){r=i,console.error(`[email] Attempt ${a}/${t} failed:`,i.message),n=null;let e=i?.responseCode||0;if(550===e||553===e||535===e||i?.code==="EAUTH")break;a<t&&await new Promise(e=>setTimeout(e,1500*a))}}throw Error(function(e){let t=(e?.message||"").toLowerCase(),r=e?.code||"",i=e?.responseCode||0;return process.env.GMAIL_USER&&process.env.GMAIL_APP_PASSWORD?"EAUTH"===r||535===i||t.includes("invalid credentials")||t.includes("username and password")?"Email service credentials are incorrect. Please contact the administrator.":550===i||553===i||t.includes("does not exist")||t.includes("no such user")||t.includes("invalid address")||t.includes("bad destination")?"That email address doesn't exist or cannot receive mail. Please check and try again.":421===i||450===i||t.includes("daily sending quota")||t.includes("rate limit")||t.includes("too many")?"Email sending limit reached. Please try again later.":"ECONNECTION"===r||"ETIMEDOUT"===r||"ESOCKET"===r||t.includes("connect")||t.includes("timeout")?"Could not connect to the email server. Please try again in a moment.":552===i||t.includes("message too large")?"The email is too large to send.":"Failed to send email. Please try again later.":"Email service is not configured. Please contact the administrator."}(r))}function s(e){return`<!DOCTYPE html>
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
  </table>`}async function c(e,t,r){let i=s(`
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
  `),n=`Hi ${t},

Your ${o} verification code is:

${r}

Expires in 30 minutes. Do not share it.

– ${o}`;await a({to:e,subject:`${r} — your ${o} verification code`,html:i,text:n,headers:{"X-Priority":"1","X-Mailer":o}})}async function d(e,t,r,i){let n=`${i}/api/auth/verify?token=${r}`,c=s(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Verify your email address</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, please confirm your email to activate your ${o} account.</p>
    ${l(n,"Verify Email Address")}
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">Link expires in 24 hours.<br/><span style="color:#888;word-break:break-all;">${n}</span></p>
  `),d=`Hi ${t},

Verify your ${o} account:
${n}

Expires in 24 hours.

– ${o}`;await a({to:e,subject:`Confirm your ${o} email address`,html:c,text:d,headers:{"X-Priority":"3","X-Mailer":o,"List-Unsubscribe":`<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`}})}async function p(e,t,r,i){let n=`${i}/reset-password?token=${r}`,c=s(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Reset your password</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, click below to choose a new password. This link expires in 1 hour.</p>
    ${l(n,"Reset Password")}
    <p style="font-size:12px;color:#555;text-align:center;margin:0;">If you did not request a reset, ignore this email.</p>
  `),d=`Hi ${t},

Reset your ${o} password:
${n}

Expires in 1 hour.

– ${o}`;await a({to:e,subject:`Reset your ${o} password`,html:c,text:d,headers:{"X-Priority":"1","X-Mailer":o,"List-Unsubscribe":`<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`}})}async function u(e,t,r){let i=s(`
    <h1 style="font-size:20px;font-weight:700;color:#fff;margin:0 0 12px;">Welcome to ${o}!</h1>
    <p style="font-size:15px;color:#aaa;line-height:1.7;margin:0 0 20px;">Hi ${t}, your account is active. Connect with fellow law students and stay updated with the community.</p>
    ${l(`${r}/dashboard`,"Go to your feed →")}
  `),n=`Hi ${t},

Welcome to ${o}!

Visit your feed: ${r}/dashboard

– ${o}`;await a({to:e,subject:`Welcome to ${o}`,html:i,text:n,headers:{"X-Priority":"3","X-Mailer":o,"List-Unsubscribe":`<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`}})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[3867,5444,1276,4449,4600,8058],()=>r(44791));module.exports=i})();