import Stripe from "stripe";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const resend = new Resend(process.env.RESEND_API_KEY);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;


export async function POST(req: NextRequest) {

  const body = await req.text();

  const signature = req.headers.get("stripe-signature");


  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }


  let event: Stripe.Event;


  try {

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );


  } catch (error) {

    console.error(
      "Webhook verification failed:",
      error
    );

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }



  console.log(
    "✅ Stripe event:",
    event.type
  );



  if (event.type === "checkout.session.completed") {


    const session =
      event.data.object as Stripe.Checkout.Session;



    const email =
      session.customer_details?.email ||
      session.customer_email;



    const website =
      session.metadata?.website;



    const auditId =
      session.metadata?.auditId;



    console.log(
      "Customer:",
      email
    );

    console.log(
      "Website:",
      website
    );

    console.log(
      "Audit ID:",
      auditId
    );



    if (!email || !auditId) {

      console.error(
        "Missing email or auditId"
      );


      return NextResponse.json(
        {
          error:
            "Missing checkout information"
        },
        {
          status:400
        }
      );
    }




    const { data: audit, error } =
      await supabase
        .from("audits")
        .select("*")
        .eq("id", auditId)
        .single();



    if (error || !audit) {

      console.error(
        "Audit not found:",
        error
      );


      return NextResponse.json(
        {
          error:"Audit not found"
        },
        {
          status:404
        }
      );
    }



    const report = audit.report;




    const { error: emailError } =
      await resend.emails.send({

        from:
          "PageInspector <reports@page-inspector.com>",


        to:
          email,


        subject:
          "Your PageInspector Website Audit Report",



        html: `

        <div style="
          font-family:Arial,sans-serif;
          max-width:700px;
          margin:auto;
          color:#2f3437;
        ">


          <div style="
            background:#18392b;
            color:white;
            padding:35px;
            border-radius:14px 14px 0 0;
          ">

            <h1>
              PageInspector
            </h1>

            <p>
              Website Audit Report
            </p>

          </div>



          <div style="
            padding:35px;
            background:white;
          ">


            <h2>
              Overall Score:
              ${audit.score}/100
            </h2>



            <h2 style="color:#18392b">
              ${report.summary.headline}
            </h2>



            <p>
              ${report.summary.description}
            </p>



            <hr />



            <h2>
              SEO Analysis
            </h2>


            <h3>
              Issues
            </h3>


            <ul>

              ${report.seo.issues
                .map(
                  (item:string)=>
                  `<li>${item}</li>`
                )
                .join("")}

            </ul>



            <h3>
              Recommendations
            </h3>


            <ul>

              ${report.seo.recommendations
                .map(
                  (item:string)=>
                  `<li>${item}</li>`
                )
                .join("")}

            </ul>




            <hr />




            <h2>
              User Experience
            </h2>


            <ul>

              ${report.ux.issues
                .map(
                  (item:string)=>
                  `<li>${item}</li>`
                )
                .join("")}

            </ul>




            <hr />




            <h2>
              Performance
            </h2>


            <ul>

              ${report.performance.issues
                .map(
                  (item:string)=>
                  `<li>${item}</li>`
                )
                .join("")}

            </ul>





            <hr />




            <h2>
              Conversion Opportunities
            </h2>


            <ul>

              ${report.conversion.issues
                .map(
                  (item:string)=>
                  `<li>${item}</li>`
                )
                .join("")}

            </ul>





            <hr />




            <h2>
              Copywriting
            </h2>


            <ul>

              ${report.copywriting.issues
                .map(
                  (item:string)=>
                  `<li>${item}</li>`
                )
                .join("")}

            </ul>






            <hr />





            <h2>
              Priority Actions
            </h2>


            <ol>


              ${report.priority_actions
                .map(
                  (item:any)=>
                  `
                  <li>
                    <strong>
                    ${item.priority}
                    </strong>
                    :
                    ${item.action}
                  </li>
                  `
                )
                .join("")}


            </ol>




            <br />


            <p>
              Thank you for using PageInspector.
            </p>


          </div>


        </div>

        `,

      });





    if (emailError) {

      console.error(
        "Resend error:",
        emailError
      );


      return NextResponse.json(
        {
          error:
          "Email could not be sent"
        },
        {
          status:500
        }
      );
    }




    console.log(
      "✅ Report sent to:",
      email
    );

  }



  return NextResponse.json({
    received:true
  });

}