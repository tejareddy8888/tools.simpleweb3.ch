// import React, { useEffect } from "react";
// import { Button } from "../../Buttons/button";
// import { Card, CardContent } from "../../components/ui/card";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { Link } from "react-router-dom";

// export const LandingPage = (): JSX.Element => {
//   useEffect(() => {
//     document.body.style.cursor = 'url("/cursor.svg") 0 0, auto';
//     return () => {
//       document.body.style.cursor = 'auto';
//     };
//   }, []);

//   const steps = [
//     {
//       number: "Step 1",
//       action: "Validate",
//       description: "Validate your wallet and transaction details",
//     },
//     {
//       number: "Step 2",
//       action: "Send Transaction",
//       description:
//         "After validation check the gas value and send the transaction",
//     },
//     {
//       number: "Step 3",
//       action: "Transaction successful",
//       description: "Transaction successfully added",
//     },
//   ];

//   return (
//     <div className="bg-black flex flex-row justify-center w-full">
//       <div className="bg-black w-[1280px] h-[1207px]">
//         <div className="relative w-[1278px] h-[1207px] bg-[url(/frame-1.svg)] bg-[100%_100%]">
//           {/* Header */}
//           <header className="w-full">
//             <nav className="flex justify-between">
//               <h1 className="absolute top-3.5 left-[37px] [font-family:'Jersey_10',Helvetica] font-normal text-[#fffcfc] text-4xl tracking-[0] leading-[normal] whitespace-nowrap">
//                 SimpleWeb3
//               </h1>
//               <button className="absolute top-3.5 left-[1146px] [font-family:'Jersey_10',Helvetica] font-normal text-[#fffcfc] text-4xl tracking-[0] leading-[normal] whitespace-nowrap">
//                 +Menu
//               </button>
//             </nav>
//           </header>

//           {/* Hero Section */}
//           <section>
//             <h2 className="absolute top-[210px] left-[37px] [font-family:'Jersey_10',Helvetica] font-normal text-[#fffcfc] text-8xl tracking-[0] leading-[normal]">
//               Simplest EVM Transaction <br />
//               Submission
//             </h2>

//             <p className="absolute top-[434px] left-[37px] [font-family:'Jersey_10',Helvetica] font-normal text-[#fffcfc] text-4xl tracking-[0] leading-[normal] whitespace-nowrap">
//               Developer Friendly Ethereum transaction submission through UI.
//             </p>

//             {/* CTA Button with shadow effect */}
//             <div className="absolute w-80 h-[62px] top-[504px] left-[37px]">
//               <div className="absolute w-[315px] h-[53px] top-[9px] left-0 bg-[#955ff9]" />
//               < Link to="/">
//               <Button className="absolute w-[315px] h-[53px] top-0 left-[5px] bg-[#d1ff03] hover:bg-[#c1ef00] [font-family:'Jersey_10',Helvetica] font-normal text-black text-4xl rounded-none">
//                 Send Transaction
//               </Button>
//               </ Link>
//             </div>
//           </section>

//           {/* How It Works Section */}
//           <section>
//             <h3 className="absolute top-[640px] left-[37px] [font-family:'Jersey_10',Helvetica] font-normal text-[#fffcfc] text-4xl tracking-[0] leading-[normal] whitespace-nowrap">
//               How It Works
//             </h3>

//             <div className="absolute top-[697px] left-[37px] flex gap-[60px]">
//               {steps.map((step, index) => (
//                 <div key={`step-${index}`} className="relative w-[365px]">
//                   <h4 className="[font-family:'Jersey_10',Helvetica] font-normal text-[#fffcfc] text-3xl tracking-[0] leading-[normal] whitespace-nowrap mb-2">
//                     {step.number}
//                   </h4>

//                   <Card
//   className="w-full h-[250px] bg-white rounded-none relative overflow-hidden"
//   style={{ imageRendering: "pixelated" }}
// >
//   {/* Pixelated jagged border with flicker animation */}
//   <div className="absolute top-0 left-0 w-2 h-2 bg-black flicker flicker-delay-1" />
//   <div className="absolute top-0 left-[4px] w-[calc(100%-4px)] h-[2px] bg-black flicker flicker-delay-2" />
//   <div className="absolute top-[4px] left-0 w-[2px] h-[calc(100%-4px)] bg-black flicker flicker-delay-3" />

//   <div className="absolute top-0 right-0 w-2 h-2 bg-black flicker flicker-delay-2" />
//   <div className="absolute top-0 right-[4px] w-[calc(100%-4px)] h-[2px] bg-black flicker flicker-delay-4" />
//   <div className="absolute top-[4px] right-0 w-[2px] h-[calc(100%-4px)] bg-black flicker flicker-delay-5" />

//   <div className="absolute bottom-0 left-0 w-2 h-2 bg-black flicker flicker-delay-4" />
//   <div className="absolute bottom-0 left-[4px] w-[calc(100%-4px)] h-[2px] bg-black flicker flicker-delay-3" />
//   <div className="absolute bottom-[4px] left-0 w-[2px] h-[calc(100%-4px)] bg-black flicker flicker-delay-1" />

//   <div className="absolute bottom-0 right-0 w-2 h-2 bg-black flicker flicker-delay-6" />
//   <div className="absolute bottom-0 right-[4px] w-[calc(100%-4px)] h-[2px] bg-black flicker flicker-delay-5" />
//   <div className="absolute bottom-[4px] right-0 w-[2px] h-[calc(100%-4px)] bg-black flicker flicker-delay-2" />

//   {/* Content */}
//   <CardContent className="p-0 h-full relative z-10">
//     <div className="absolute w-[315px] h-[53px] top-[103px] left-[25px] bg-[#955ff9]" />
//     <Button className="absolute w-[315px] h-[53px] top-[94px] left-[28px] bg-[#d1ff03] hover:bg-[#c1ef00] [font-family:'Jersey_10',Helvetica] font-normal text-black text-4xl rounded-none">
//       {step.action}
//     </Button>
//   </CardContent>
// </Card>




//                 </div>
//               ))}
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
    
//   );
// };