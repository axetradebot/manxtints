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
            <h2 className="text-2xl font-semibold mb-4">5. Cookies &amp; Local Storage</h2>
            <p className="text-muted-foreground">
              We keep cookies to a minimum and use none for advertising by default. The site sets:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>
                <strong className="text-foreground">mt_zone</strong> (functional cookie, 30 days) — remembers the
                pricing area you chose or that an ad link set, so the prices you see stay consistent between
                visits. It contains only the area name (for example &quot;iom&quot;, &quot;north&quot; or &quot;se&quot;), never
                your address. We may also use your approximate location from your IP address to pick a sensible
                default area; this is always shown to you and can be changed with one tap next to any price.
              </li>
              <li>
                <strong className="text-foreground">mt_session</strong> (session storage, cleared when the tab
                closes) — a random ID used for anonymous, first-party analytics on how the quote calculator is
                used. It is not linked to your name or contact details.
              </li>
              <li>
                <strong className="text-foreground">mt_calc_windows</strong> (session storage) — your typed
                window measurements, so a refresh does not lose them.
              </li>
              <li>
                <strong className="text-foreground">_fbp / _fbc</strong> — set by Meta only where our Meta Pixel
                is enabled, to measure the effectiveness of our advertising.
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Functional cookies are necessary for the site to work as you expect and do not require consent.
              You can clear them at any time from your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal data. 
              Contact us at manxtints@gmail.com to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              For any privacy-related questions, please contact us at:<br />
              Email: manxtints@gmail.com<br />
              Phone: +44 7624 331401
            </p>
          </section>

          <p className="text-sm text-muted-foreground pt-8 border-t border-border">
            Last updated: September 2026
          </p>
        </div>
      </div>
    </div>
  )
}
