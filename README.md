# Nishant Kumar — Portfolio

A complete, responsive portfolio using the original live website's HTML, stylesheet, local fonts, cinematic image, and interactions, together with your supplied content file. It does not change the existing ChatGPT-hosted website.

## Open immediately

Open `public/index.html` in your browser. The included generated files work without installing anything. Fonts and the cinematic background are included locally. Project videos need internet access.

## Edit your content

Edit `content.json` to change project titles, descriptions, video URLs, contact details, or software. Keep JSON formatting valid, save it, then run `npm run build` with Node.js 18 or newer installed. This refreshes the files in `public/`. To change the design, edit files in `src/` and rebuild.

You can use VS Code to edit the files. No paid software or packages are required.

## Preview locally

From this folder run `npm run dev`, then open http://127.0.0.1:4173. Stop the server with Ctrl+C.

## Publish on Vercel

1. Create a GitHub repository and upload the contents of this project folder (including `src`, `content.json`, `package.json`, and `vercel.json`).
2. Sign in to Vercel, choose Add New → Project, and import that repository.
3. Use Framework Preset **Other**, Build Command **npm run build**, and Output Directory **public**. The included configuration already declares these values.
4. Select Deploy. Vercel provides the new live URL.

Alternatively, with the Vercel CLI installed, run `vercel login`, then `vercel --prod` from this folder. Choose Other if prompted for the framework. Vercel must authenticate your own account; no credentials are included here.

After importing the Git repository, future committed changes trigger deployments. Update `content.json` in GitHub to edit your site without using local commands; Vercel runs the build automatically.

## Edit directly in the browser

Append `?edit=1` to the website URL (or local index.html URL). An **Edit portfolio** button appears in the footer. You can edit projects and contact details, or import your JSON file. Changes are saved only in that browser. Use **Export content**, replace the project's root `content.json` with that export, and rebuild/redeploy to make changes visible to all visitors. The editor is a local drafting tool, not a server-based admin dashboard.

## Included behavior

- All six projects and contact details from the supplied JSON
- Responsive desktop and mobile layouts
- Original three-column project grid, cinematic hero, warm accents, fonts, and coastline image
- Category filters, project dialogs, case detail tabs, project navigation, and video controls
- Original interactive color-comparison slider and editing specialties
- Browser draft editor with JSON import/export
- Email and telephone links
- Reduced-motion support and keyboard navigation
- No fabricated clients, testimonials, or statistics

Video files remain at the original URLs provided in the content file. Their availability depends on that hosting service. All supplied concept flags and descriptions are preserved; review the UGC project's case details, which currently describe an artist/event teaser in your source file.

No backend, contact-form inbox, or analytics is included. The project brief prepares an email for the visitor to review and send. Published content changes are made in `content.json` and republished.
