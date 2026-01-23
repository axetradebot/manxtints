import { Badge } from "@/components/ui/badge"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto">
        <Badge variant="electric" className="mb-6">Legal</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Services</h2>
            <p className="text-muted-foreground">
              ManxTints LTD provides professional window tinting services for vehicles, 
              residential properties, and commercial buildings across the Isle of Man. 
              All services are subject to these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Quotes & Pricing</h2>
            <p className="text-muted-foreground">
              All quotes provided are valid for 30 days unless otherwise stated. 
              Final pricing may vary if actual measurements differ from estimates 
              or if additional work is required. We reserve the right to adjust 
              pricing based on material costs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Booking & Cancellation</h2>
            <p className="text-muted-foreground">
              A deposit may be required to secure your booking. Cancellations made 
              less than 24 hours before the scheduled appointment may incur a 
              cancellation fee. We will make reasonable efforts to reschedule 
              where possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Warranty</h2>
            <p className="text-muted-foreground">
              We provide warranties on our window film installations:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Standard films: 5 year guarantee against peeling, bubbling, and fading</li>
              <li>Premium ceramic films: 5 year guarantee</li>
              <li>Warranty covers materials and installation workmanship</li>
              <li>Warranty does not cover damage caused by misuse, accidents, or improper cleaning</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Care Instructions</h2>
            <p className="text-muted-foreground">
              To maintain your warranty, please follow our aftercare instructions:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Wait 3-5 days before cleaning newly tinted windows</li>
              <li>Use ammonia-free cleaning products only</li>
              <li>Avoid abrasive materials when cleaning</li>
              <li>Do not use adhesive stickers on tinted surfaces</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Legal Compliance</h2>
            <p className="text-muted-foreground">
              We ensure all vehicle tinting complies with Isle of Man road regulations. 
              Front side windows must allow at least 70% light transmission. Customers 
              are responsible for ensuring any modifications comply with current 
              legislation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Our liability is limited to the cost of the services provided. 
              We are not liable for any indirect, incidental, or consequential 
              damages arising from our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, please contact us at:<br />
              Email: manxtints@gmail.com<br />
              Phone: +44 7624 331401
            </p>
          </section>

          <p className="text-sm text-muted-foreground pt-8 border-t border-border">
            Last updated: January 2026
          </p>
        </div>
      </div>
    </div>
  )
}
