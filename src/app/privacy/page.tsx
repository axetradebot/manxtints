import { Badge } from "@/components/ui/badge"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-3xl mx-auto">
        <Badge variant="electric" className="mb-6">Legal</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              ManxTints LTD (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your personal 
              information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground">
              We may collect personal information including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Name and contact details (phone, email, address)</li>
              <li>Vehicle registration numbers</li>
              <li>Property addresses</li>
              <li>Project requirements and preferences</li>
              <li>Communication history with us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Provide quotes and complete tinting services</li>
              <li>Communicate about your project</li>
              <li>Send appointment reminders</li>
              <li>Improve our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal data. 
              Contact us at manxtints@gmail.com to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground">
              For any privacy-related questions, please contact us at:<br />
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
