All-Weather Wealth Strategy Pitch Page

A premium, minimalist web application designed for Raghuvir Consultants to pitch the "All-Weather Wealth Strategy" to High-Net-Worth Individuals (HNIs) such as doctors and politicians.

🚀 Overview

This project is a single-page marketing site that contrasts traditional Fixed Deposits with a diversified ETF-based strategy. It features:

Interactive Data Visualization: A Chart.js-powered breakdown of asset allocation (55% Bonds, 30% Equity, 15% Real Assets).

Tax Efficiency Logic: Updated details reflecting 2026 Indian tax laws regarding LTCG and holding periods.

Modern UI: Built with Tailwind CSS, utilizing a sophisticated "Inter" and "Playfair Display" typography pairing.

📂 File Structure

index.html: The core application containing all HTML, CSS (Tailwind), and JavaScript (Chart.js).

Dockerfile: Configuration for containerizing the application for Coolify.

nginx.conf: Optimized Nginx configuration for serving static content with Gzip compression enabled.

🛠 Deployment via Coolify

This project is optimized for deployment on your Coolify dashboard at https://manage.raghuvirconsultants.in.

Step-by-Step Instructions:

Create Repository: Push these three files (index.html, Dockerfile, nginx.conf) to a new repository on GitHub or GitLab.

Add Resource: In Coolify, go to your Project and select Add New Resource -> Public/Private Repository.

Automatic Detection: Coolify will automatically detect the Dockerfile.

Domain Setup:

Navigate to the Settings tab of the new application in Coolify.

In the Domains field, enter your target URL (e.g., https://strategy.raghuvirconsultants.in).

Deploy: Click Deploy. Coolify will build the Docker image, set up the SSL certificate via Let's Encrypt, and start serving the page.

📈 Content Highlights

The Philosophy: Moving from "safe" assets to inflation-beating strategies.

Performance: Target returns of 9.0% - 10.5% vs. traditional 6.5% - 7.5% FDs.

Liquidity: Highlighting T+2 liquidity with no lock-in periods.

Taxation: Detailed breakdown of Equity, Debt, and Gold/Silver taxation as of Feb 2026.

📝 Maintenance

To update the content (e.g., changing the target return or updating the advisor note):

Open index.html.

Edit the text within the HTML tags.

Commit and push the changes to your Git repository.

Coolify will automatically trigger a re-deployment.
