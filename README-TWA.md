# Google Play Store Deployment (TWA)

To deploy Krishna Naturals to the Google Play Store, we will use **Bubblewrap**, a CLI tool that wraps your Progressive Web App (PWA) into a Trusted Web Activity (TWA) - an actual Android app `.aab` file that can be submitted to the store.

## Prerequisites
You must have the following installed on your Windows machine:
1. **Node.js** (You already have this)
2. **Java Development Kit (JDK) 17+**
3. **Android Studio** (or Android SDK command-line tools)

## Step 1: Initialize Bubblewrap
Run the following command in an empty folder (e.g., `C:\KrishnaNaturals-App`):

```powershell
npx @google/bubblewrap init --manifest="https://krishnanaturals.co.in/manifest.json"
```

Bubblewrap will ask you a series of questions:
- **Domain**: `krishnanaturals.co.in`
- **URL path**: `/`
- **App name**: `Krishna Naturals`
- **Short name**: `Krishna Naturals`
- **Application ID**: `in.co.krishnanaturals.twa`
- **Display mode**: `standalone`
- **Status bar color**: `#1B4332`
- **Key Store**: It will ask to create a new keystore. *Write down the password and keep the `.keystore` file extremely safe!* You need it for all future app updates.

## Step 2: Build the App
Once initialization is complete, run:

```powershell
npx @google/bubblewrap build
```

This will generate an `app-release-bundle.aab` file.

## Step 3: Asset Links (Crucial for TWA)
For your app to open fullscreen without showing the Chrome address bar, you MUST prove ownership of the domain.
1. When Bubblewrap finishes building, it generates an `assetlinks.json` file.
2. We need to host this file on your website at: `https://krishnanaturals.co.in/.well-known/assetlinks.json`.
3. Take the contents of the generated `assetlinks.json` and paste it into `/public/.well-known/assetlinks.json` in your Next.js project.
4. Deploy the Next.js project so the file goes live.

## Step 4: Submit to Play Console
1. Go to the [Google Play Console](https://play.google.com/console).
2. Create a new App.
3. Fill out the store listing details (Descriptions, Screenshots, etc.).
4. Under "Production" -> "Releases", upload the `app-release-bundle.aab` file.
5. Submit for Review!
