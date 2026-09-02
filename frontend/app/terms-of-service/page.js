export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Core Bit Media.'
};

// Verbatim from the live corebitmedia.com/terms-of-service/ page (WordPress
// database export, Aug 2026) — this is the site's own actual published text.
const SECTIONS = [
  {
    heading: 'Who We Are',
    body: 'The website address is: https://www.corebitmedia.com.'
  },
  {
    heading: 'Comments',
    body: [
      'When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection.',
      'An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/. After approval of your comment, your profile picture is visible to the public in the context of your comment.'
    ]
  },
  {
    heading: 'Media',
    body: 'If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included, as visitors to the website can download and extract any location data from images on the website.'
  },
  {
    heading: 'Cookies',
    body: [
      'Comment cookies persist for one year. Login cookies last two days; screen option cookies last one year. The "Remember Me" function extends login to two weeks. Article edit cookies expire after one day and contain no personal data.'
    ]
  },
  {
    heading: 'Embedded Content From Other Websites',
    body: [
      'Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.',
      'These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.'
    ]
  },
  {
    heading: 'Who We Share Your Data With',
    body: 'If you request a password reset, your IP address will be included in the reset email.'
  },
  {
    heading: 'How Long We Retain Your Data',
    body: [
      'Comments are retained indefinitely for automatic approval of follow-ups. Registered user profiles are stored and remain editable by the user or an administrator at any time.'
    ]
  },
  {
    heading: 'Your Data Rights',
    body: 'If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.'
  },
  {
    heading: 'Where Your Data Is Sent',
    body: 'Visitor comments may be checked through an automated spam detection service.'
  }
];

export default function TermsOfServicePage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <div className="eyebrow">Strategic Digital Marketing for Scalable Growth</div>
        <h1>Terms of Service</h1>

        {SECTIONS.map((s) => (
          <div key={s.heading} style={{ marginTop: 32 }}>
            <h3>{s.heading}</h3>
            {(Array.isArray(s.body) ? s.body : [s.body]).map((p, i) => (
              <p key={i} className="text-muted" style={{ marginTop: 10, lineHeight: 1.8 }}>{p}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
