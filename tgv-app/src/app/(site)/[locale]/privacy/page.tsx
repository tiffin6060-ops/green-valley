import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { localePath, type Locale } from "@/i18n/routing";
import { legalMetadata } from "@/lib/seo";
import { contact, site } from "@/data/content";

// The header reads live data (published updates), so render per request like the home page.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  return legalMetadata(params, "privacy", "/privacy");
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const tel = `tel:${contact.phone.replace(/[^+\d]/g, "")}`;

  // Bangla version: unreviewed translation of the English text below; the English text is the authoritative version.
  if (locale === "bn") {
    return (
      <LegalPage title="Privacy Policy" bangla={{ title: "গোপনীয়তা নীতি", lastUpdated: "১৬ অক্টোবর ২০২৬" }}>
        <p>
          এই গোপনীয়তা নীতিতে ব্যাখ্যা করা হয়েছে, {site.name} (“আমরা” বা “আমাদের”) এই ওয়েবসাইটের মাধ্যমে কী ধরনের ব্যক্তিগত তথ্য
          সংগ্রহ করে, কেন সেই তথ্য সংগ্রহ করা হয় এবং কীভাবে তা ব্যবহার, সংরক্ষণ ও পরিচালনা করা হয়।
        </p>
        <p>
          আমাদের সঙ্গে যোগাযোগ করতে পারেন:
          <br />
          <strong>ইমেইল:</strong> <a className="underline" href={`mailto:${contact.email}`}>{contact.email}</a>
          <br />
          <strong>ফোন:</strong> <a className="underline" href={tel}>{contact.phone}</a>
        </p>

        <h2>১. আমরা কোন ধরনের তথ্য সংগ্রহ করি</h2>
        <p>আপনি আমাদের খামার পরিদর্শনের অনুরোধ ফর্ম পূরণ ও জমা দিলে আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:</p>
        <ul>
          <li>আপনার নাম ও মোবাইল নম্বর;</li>
          <li>আপনার ইমেইল ঠিকানা (যদি প্রদান করেন);</li>
          <li>আপনার আগ্রহের বিষয়, পরিদর্শনের পছন্দের তারিখ, অতিথির সংখ্যা এবং আপনার দেওয়া অতিরিক্ত তথ্য বা বার্তা;</li>
          <li>
            অনুরোধ জমা দেওয়ার সময় আপনার ব্যবহৃত আইপি (IP) ঠিকানা এবং অনুরোধ জমা দেওয়ার সময়, যা স্প্যাম ও অননুমোদিত ব্যবহার
            প্রতিরোধে ব্যবহৃত হয়।
          </li>
        </ul>
        <p>
          আপনার যদি বিনিয়োগকারী বা কর্মী অ্যাকাউন্ট থাকে, তাহলে আমরা প্রয়োজন অনুযায়ী আপনার নাম, ইমেইল ঠিকানা, মোবাইল নম্বর,
          নিরাপদ পদ্ধতিতে হ্যাশ করা পাসওয়ার্ড, বিনিয়োগসংক্রান্ত তথ্য, সহায়তার অনুরোধ, সংশ্লিষ্ট নথিপত্র এবং অ্যাকাউন্টের
          কার্যক্রমের রেকর্ড সংরক্ষণ করি।
        </p>

        <h2>২. কুকির ব্যবহার</h2>
        <p>
          আমাদের ওয়েবসাইটের স্বাভাবিক কার্যক্রম ও ব্যবহারকারীর সুবিধা নিশ্চিত করতে আমরা শুধু প্রয়োজনীয় কুকি ব্যবহার করি।
        </p>
        <p>এই কুকিগুলোর মধ্যে রয়েছে:</p>
        <ul>
          <li>
            <strong>লগইন কুকি:</strong> আপনি আপনার অ্যাকাউন্টে লগইন করলে এই কুকি সক্রিয় হয় এবং আপনার লগইন সেশন নিরাপদ রাখতে সহায়তা করে।
          </li>
          <li>
            <strong>ভাষা নির্বাচন কুকি:</strong> ওয়েবসাইটে আপনার নির্বাচিত বাংলা বা ইংরেজি ভাষার পছন্দ সর্বোচ্চ এক বছর পর্যন্ত সংরক্ষণ করে।
          </li>
        </ul>
        <p>
          যেসব পেজে ইউটিউব ভিডিও সংযুক্ত রয়েছে, সেখানে আমরা ইউটিউবের <strong>Privacy-Enhanced Mode</strong> ব্যবহার করি। এই ব্যবস্থায়
          ভিডিও চালু করার আগে ইউটিউবের কোনো কুকি সংরক্ষণ করা হয় না।
        </p>

        <h2>৩. আমরা আপনার তথ্য কীভাবে ব্যবহার করি</h2>
        <p>আপনার কাছ থেকে সংগৃহীত ব্যক্তিগত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করা হয়:</p>
        <ul>
          <li>আপনার খামার পরিদর্শনের অনুরোধ পর্যালোচনা, যোগাযোগ এবং পরিদর্শনের ব্যবস্থা করতে;</li>
          <li>আপনার পাঠানো প্রশ্ন, অনুরোধ বা জিজ্ঞাসার উত্তর দিতে;</li>
          <li>বিনিয়োগকারী ও কর্মীদের অ্যাকাউন্ট পরিচালনা এবং সেগুলোর নিরাপত্তা নিশ্চিত করতে;</li>
          <li>ওয়েবসাইটকে স্প্যাম, অননুমোদিত প্রবেশ ও অপব্যবহার থেকে সুরক্ষিত রাখতে।</li>
        </ul>
        <p>
          আমরা আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি করি না। আপনার সম্মতি ছাড়া সংগৃহীত তথ্য অন্য কোনো সম্পর্কহীন
          বিপণনমূলক উদ্দেশ্যেও ব্যবহার করি না।
        </p>

        <h2>৪. ফেসবুক ও মেটা (Meta)</h2>
        <p>
          আমরা আমাদের ওয়েবসাইট, খামার এবং সংশ্লিষ্ট সেবার প্রচারের জন্য ফেসবুক ও ইনস্টাগ্রামে বিজ্ঞাপন পরিচালনা করতে পারি।
        </p>
        <p>
          আপনি যদি মেটার কোনো বিজ্ঞাপনের মাধ্যমে আমাদের ওয়েবসাইটে প্রবেশ করেন অথবা বিজ্ঞাপনের কার্যকারিতা পরিমাপ ও উন্নত করার জন্য
          আমরা <strong>Meta Pixel</strong>-এর মতো কোনো প্রযুক্তি ব্যবহার করি, তাহলে মেটা আপনার ওয়েবসাইট ব্যবহারের কিছু প্রাথমিক তথ্য
          সংগ্রহ করতে পারে।
        </p>
        <p>এসব তথ্যের মধ্যে থাকতে পারে:</p>
        <ul>
          <li>আপনি ওয়েবসাইটের কোন পেজ পরিদর্শন করেছেন;</li>
          <li>আপনার ব্যবহৃত ডিভাইস ও ব্রাউজার-সংক্রান্ত তথ্য;</li>
          <li>আপনি কোনো ফর্ম জমা দিয়েছেন কি না।</li>
        </ul>
        <p>মেটা তাদের নিজস্ব গোপনীয়তা নীতি অনুযায়ী এসব তথ্য পরিচালনা করে।</p>
        <p>
          আপনি ফেসবুক ও ইনস্টাগ্রামের বিজ্ঞাপন সেটিংস থেকে বিজ্ঞাপনের ব্যক্তিগতকরণসংক্রান্ত পছন্দ নিয়ন্ত্রণ করতে পারেন।
        </p>
        <p>
          আমরা আপনার খামার পরিদর্শনের অনুরোধে লেখা ব্যক্তিগত বার্তা কিংবা বিনিয়োগকারী ও কর্মী অ্যাকাউন্টের তথ্য মেটার সঙ্গে শেয়ার করি না।
        </p>

        <h2>৫. কারা আপনার তথ্য প্রক্রিয়াকরণ করে</h2>
        <p>
          ওয়েবসাইটের মাধ্যমে জমা দেওয়া ফর্মের তথ্য আমাদের ইমেইল সেবা প্রদানকারী <strong>Resend</strong>-এর মাধ্যমে সংশ্লিষ্ট দলের কাছে
          পাঠানো হয়।
        </p>
        <p>পাশাপাশি এসব তথ্য আমাদের নিজস্ব সার্ভারের একটি সুরক্ষিত ডেটাবেসে সংরক্ষণ করা হয়।</p>
        <p>আমাদের ওয়েবসাইট পরিচালনা ও সচল রাখতে হোস্টিং সেবাদাতার সহায়তা নেওয়া হয়।</p>
        <p>
          এসব সেবাদাতা আমাদের পক্ষ থেকে প্রয়োজনীয় তথ্য প্রক্রিয়াকরণ করে। সেবা পরিচালনার প্রয়োজনে কিছু তথ্য বাংলাদেশের বাইরের
          সার্ভারেও সংরক্ষিত হতে পারে।
        </p>
        <p>
          প্রযোজ্য আইনের বাধ্যবাধকতা ছাড়া আমরা আপনার ব্যক্তিগত তথ্য অন্য কোনো অননুমোদিত ব্যক্তি বা প্রতিষ্ঠানের সঙ্গে শেয়ার করি না।
        </p>

        <h2>৬. আমরা কতদিন আপনার তথ্য সংরক্ষণ করি</h2>
        <p>
          খামার পরিদর্শনের অনুরোধসংক্রান্ত তথ্য আপনার সঙ্গে সর্বশেষ যোগাযোগের পর সর্বোচ্চ <strong>১২ মাস</strong> পর্যন্ত সংরক্ষণ করা
          হয়। এরপর সেই তথ্য মুছে ফেলা হয়।
        </p>
        <p>বিনিয়োগকারী ও কর্মীদের অ্যাকাউন্টসংক্রান্ত তথ্য সংশ্লিষ্ট অ্যাকাউন্ট সক্রিয় থাকা পর্যন্ত সংরক্ষণ করা হয়।</p>
        <p>
          এ ছাড়া প্রযোজ্য আইন, হিসাবরক্ষণ বা অন্যান্য আইনগত বাধ্যবাধকতার কারণে নির্দিষ্ট কিছু তথ্য প্রয়োজনীয় সময় পর্যন্ত সংরক্ষণ
          করা হতে পারে।
        </p>

        <h2>৭. শিশু ও অপ্রাপ্তবয়স্কদের তথ্য</h2>
        <p>এই ওয়েবসাইট ১৮ বছরের কম বয়সী ব্যক্তিদের জন্য তৈরি করা হয়নি।</p>
        <p>আমরা জেনেশুনে ১৮ বছরের কম বয়সী কোনো ব্যক্তির ব্যক্তিগত তথ্য সংগ্রহ করি না।</p>

        <h2>৮. আপনার অধিকার ও ব্যক্তিগত তথ্য মুছে ফেলার অনুরোধ</h2>
        <p>
          আমাদের কাছে সংরক্ষিত আপনার ব্যক্তিগত তথ্য সম্পর্কে জানার, তা সংশোধন করার অথবা মুছে ফেলার জন্য আপনি অনুরোধ করতে পারেন।
        </p>
        <p>
          এ ধরনের অনুরোধের জন্য আমাদের সঙ্গে যোগাযোগ করুন:
          <br />
          <strong>ইমেইল:</strong> <a className="underline" href={`mailto:${contact.email}`}>{contact.email}</a>
          <br />
          <strong>ফোন:</strong> <a className="underline" href={tel}>{contact.phone}</a>
        </p>
        <p>আপনার অনুরোধ পাওয়ার পর আমরা <strong>৩০ দিনের মধ্যে</strong> উত্তর প্রদান করব।</p>
        <p>
          আপনি যদি আপনার ব্যক্তিগত তথ্য মুছে ফেলতে চান, তাহলে যে নাম ও মোবাইল নম্বর ব্যবহার করে তথ্য জমা দিয়েছিলেন, তা উল্লেখ করে
          আমাদের ইমেইল করুন।
        </p>
        <p>
          আপনার পরিচয় ও অনুরোধ যাচাই করার পর প্রযোজ্য আইন অনুযায়ী সংরক্ষণ করা বাধ্যতামূলক নয়—এমন ব্যক্তিগত তথ্য আমাদের রেকর্ড থেকে
          মুছে ফেলা হবে।
        </p>

        <h2>৯. গোপনীয়তা নীতির পরিবর্তন</h2>
        <p>
          ওয়েবসাইটের কার্যক্রম, প্রযুক্তি, সেবা কিংবা প্রযোজ্য আইনের পরিবর্তনের কারণে আমরা সময়ে সময়ে এই গোপনীয়তা নীতি সংশোধন বা
          হালনাগাদ করতে পারি।
        </p>
        <p>কোনো পরিবর্তন করা হলে এই পেজের শুরুতে উল্লেখিত <strong>“সর্বশেষ হালনাগাদ”</strong> তারিখ পরিবর্তন করা হবে।</p>
        <p>আমাদের অন্যান্য আইনি নথি:</p>
        <ul>
          <li><Link className="underline" href={localePath(locale, "/terms")}>ব্যবহারের শর্তাবলি</Link> (ইংরেজি)</li>
          <li><Link className="underline" href={localePath(locale, "/risk-disclosure")}>ঝুঁকি সংক্রান্ত তথ্য</Link> (ইংরেজি)</li>
        </ul>
        <p>
          <strong>ভাষাসংক্রান্ত ঘোষণা:</strong> এই গোপনীয়তা নীতির বাংলা ও ইংরেজি সংস্করণের মধ্যে কোনো অসংগতি বা অর্থগত পার্থক্য দেখা দিলে
          ইংরেজি সংস্করণ প্রাধান্য পাবে।
        </p>
      </LegalPage>
    );
  }

  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what personal information {site.name} (“we”, “us”) collects through this website, why we
        collect it and how we handle it. You can reach us at{" "}
        <a className="underline" href={`mailto:${contact.email}`}>{contact.email}</a> or on{" "}
        <a className="underline" href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a>.
      </p>

      <h2>What we collect</h2>
      <p>When you submit the farm-visit request form we collect:</p>
      <ul>
        <li>your name and mobile number;</li>
        <li>your email address, if you provide it;</li>
        <li>your area of interest, preferred visit date, number of guests and any message you write;</li>
        <li>the IP address the request came from and the time it was sent (used to prevent spam and abuse).</li>
      </ul>
      <p>
        If you hold an investor or staff account, we also store your name, email, mobile number, an encrypted
        (hashed) password, your investment records, support tickets, documents we share with you and a log of account
        actions.
      </p>

      <h2>Cookies</h2>
      <p>We use only essential cookies, which the website needs to work:</p>
      <ul>
        <li>a login cookie, set only when you sign in to your account, which keeps you signed in securely;</li>
        <li>a language cookie, which remembers your English/Bangla choice for up to one year.</li>
      </ul>
      <p>
        Pages with embedded YouTube videos use YouTube’s privacy-enhanced mode, which does not store cookies until you
        play the video.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>to contact you about your visit request and arrange the visit;</li>
        <li>to answer the questions you send us;</li>
        <li>to provide and secure investor and staff accounts;</li>
        <li>to protect the website from spam and misuse.</li>
      </ul>
      <p>We do not sell your personal information, and we do not use it for unrelated marketing without your consent.</p>

      <h2>Facebook / Meta</h2>
      <p>
        We may promote this website on Facebook and Instagram. If you arrive from a Meta advertisement, or if we use
        Meta tools such as the Meta Pixel to measure and improve our advertising, Meta may receive basic usage
        information such as the pages you view, your device and browser details and whether you submitted a form. Meta
        handles that data under its own policies. You can control ad personalisation in your Facebook and Instagram ad
        settings. We do not give Meta your visit-request messages or account details.
      </p>

      <h2>Who processes it</h2>
      <p>
        Form submissions are emailed to our team using an email delivery provider (Resend) and stored in a secure
        database on our servers. The website is run with the help of our hosting provider. These providers process
        data on our behalf and may store it outside Bangladesh. We do not share your information with anyone else
        except where the law requires it.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep visit requests for up to 12 months after your last contact with us, then delete them. Account records
        are kept while your account is active and for as long as we are required to keep them for legal or accounting
        reasons.
      </p>

      <h2>Children</h2>
      <p>This website is not directed at anyone under 18, and we do not knowingly collect their information.</p>

      <h2>Your choices and data deletion</h2>
      <p>
        You can ask us to show, correct or delete the information we hold about you by emailing{" "}
        <a className="underline" href={`mailto:${contact.email}`}>{contact.email}</a> or calling{" "}
        <a className="underline" href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a>. We will
        reply within 30 days. To delete your data, email us with the name and mobile number you used. After we
        verify your identity and request, we will remove your records, except anything we must keep by law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. The date at the top shows when it last changed. See also our{" "}
        <Link className="underline" href={localePath(locale, "/terms")}>Terms of Use</Link> and{" "}
        <Link className="underline" href={localePath(locale, "/risk-disclosure")}>Risk Disclosure</Link>.
      </p>
    </LegalPage>
  );
}
