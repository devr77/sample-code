"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[666],{56666:function(t,e,n){n.r(e);var o=n(74165),r=n(15861),a=n(29439),i=n(62812),s=n(55924),c=n(1225),d=n(4346),l=n(8047),m=n(50228),u=n(75579),p=n(72791),h=n(60364),x=n(43504),f=n(32898),g=n(11059),v=n(80184);e.default=function(){var t,e=(0,h.I0)(),n=(0,x.lr)(),Z=(0,a.Z)(n,1)[0],j=JSON.parse(localStorage.getItem("AppointmentData")),y=JSON.parse(localStorage.getItem("UserInformation")),N=localStorage.getItem("paidSource"),k=p.useState(""),P=(0,a.Z)(k,2),b=P[0],B=P[1];p.useEffect((function(){var t;!function(){(t=t||(0,r.Z)((0,o.Z)().mark((function t(){var e;return(0,o.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,g.Z.post("doctor/doctor",{did:Z.get("doctor")});case 2:e=t.sent,B(e.data.doctor);case 4:case"end":return t.stop()}}),t)})))).apply(this,arguments)}()}),[]);return(0,v.jsxs)(p.Fragment,{children:[(0,v.jsx)(i.Z,{variant:"h6",gutterBottom:!0,children:"Appointment summary"}),(0,v.jsx)(s.Z,{disablePadding:!0,children:(0,v.jsxs)(c.ZP,{sx:{py:1,px:0},children:[(0,v.jsx)(d.Z,{primary:"Dr ".concat(null===b||void 0===b?void 0:b.firstName," ").concat(null===b||void 0===b?void 0:b.lastName),secondary:"".concat(null===b||void 0===b?void 0:b.specialists)}),(0,v.jsx)(i.Z,{variant:"body2",children:"Rs.".concat(null===b||void 0===b?void 0:b.fees)})]},"".concat(null===b||void 0===b?void 0:b.firstName))}),(0,v.jsxs)(l.ZP,{container:!0,spacing:2,children:[(0,v.jsxs)(l.ZP,{item:!0,xs:12,sm:6,children:[(0,v.jsx)(i.Z,{variant:"h6",gutterBottom:!0,sx:{mt:2},children:"Appointment Address"}),(0,v.jsx)(i.Z,{gutterBottom:!0,children:"".concat(j.firstName," ").concat(j.lastName)}),(0,v.jsx)(i.Z,{gutterBottom:!0,children:"".concat(null===y||void 0===y?void 0:y.mobileNo)}),(0,v.jsx)(i.Z,{gutterBottom:!0,children:"".concat(j.Address,", ").concat(j.city)})]}),(0,v.jsxs)(l.ZP,{item:!0,container:!0,direction:"column",xs:12,sm:6,children:[(0,v.jsx)(i.Z,{variant:"h6",gutterBottom:!0,sx:{mt:2},children:"Payment details"}),(0,v.jsxs)(l.ZP,{container:!0,children:["offline"===N?(0,v.jsx)(i.Z,{gutterBottom:!0,children:"Cash Payment"}):(0,v.jsx)(i.Z,{gutterBottom:!0,children:"Online Payment"}),(0,v.jsx)(l.ZP,{item:!0,xs:12,children:(0,v.jsxs)(m.Z,{sx:{display:"flex",justifyContent:"flex-end"},children:[(0,v.jsx)(u.Z,{sx:{mt:3,ml:1},onClick:function(){return e((0,f.$G)(1))},children:"Back"}),(0,v.jsx)(u.Z,{variant:"contained",sx:{mt:3,ml:1},onClick:function(){return(t=t||(0,r.Z)((0,o.Z)().mark((function t(){var n;return(0,o.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,g.Z.post("appointment",{doctor:Z.get("doctor"),registrator:"user",paidSource:N,firstName:j.firstName,lastName:j.lastName,age:j.age,gender:j.gender,mobileNo:null===y||void 0===y?void 0:y.mobileNo,address:j.Address,city:j.city,state:j.state,problem:j.problem,height:j.height,weight:j.weight,amountPaid:null===b||void 0===b?void 0:b.fees});case 3:200===(n=t.sent).status&&(localStorage.setItem("AppointmentId",n.data.appointment.id),e((0,f.di)(1))),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(0),console.log(t.t0);case 10:case"end":return t.stop()}}),t,null,[[0,7]])})))).apply(this,arguments)},children:"Make Appointment"})]})})]})]})]})]})}}}]);
//# sourceMappingURL=666.6cce15d8.chunk.js.map