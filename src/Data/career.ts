const imgs = {
  Concentrix: "../Assets/career/concentrix.jpg",
  ACSoftware: "../Assets/career/acsoftware.jpg",
  ACSPro: "../Assets/career/acs-pro.jpg",
  SIDE: "../Assets/career/SIDE.jpg",
  IdeaMaker: "../Assets/career/ideamaker.jpg",
  LIQ: "../Assets/career/liq.png",
  PAK: "../Assets/career/pak.jpeg",
};

export const career = [
    {
    Place: "SIDE",
    Role: "Senior QA Tester",
    Description: [
      "Test multiple AAA titles across PC, Steam, PlayStation, Xbox, and Nintendo Switch 2.",
      "Use Jira and TestRail to document, track, and manage defects through the full lifecycle.",
      "Execute exploratory, smoke, and regression tests to validate stability and functionality.",
      "Identify game-breaking bugs, reproduction steps, and platform-specific issues under certification standards.",
      "Collaborate with dev/QA teams to verify fixes and ensure a seamless player experience across hardware.",
    ],
    From: new Date("2025-12-02"),
    To: 'Today',
    Image: img.SIDE,
  },
    {
    Place: "ACS Pro",
    Role: "TI Support Analist",
    Description: [
      "Administer ManageEngine CRM tools, including configuration, custom workflows, and module customization.,
      "Provide Tier 1/Tier 2 support, troubleshooting synchronization, data, API, and performance issues.",
      "Manage users, roles, and access controls; perform database maintenance and system health checks.",
      "Create technical documentation, user guides, and training to improve CRM adoption.",
      "Translate business needs into CRM solutions and collaborate with teams to ensure system efficiency.",
    ],
    From: new Date("2025-01-04"),
    To: new Date("2025-07-02"),
    Image: img.ACSPro,
  },
  {
    Place: "ACSoftware",
    Role: "BI Agent",
    Description: [
      "Transitioned from Customer Support to BI, using product and customer knowledge to drive data-informed decisions.",
      "Bridge development teams and stakeholders by translating complex technical data into actionable business insights.",
      "Analyze and monitor KPIs for IT management software; build executive dashboards on usage, satisfaction, and market trends.",
      "Identify customer behavior and usage patterns to inform product priorities; report on adoption and feature utilization.",
      "Partner with development on data collection strategies and support sales with data-backed prospect insights.",
    ],
    From: new Date("2024-06-10"),
    To: new Date("2025-01-04"),
    Image: img.ACSoftware,
  },
  {
    Place: "Concentrix",
    Role: "IT Analist",
    Description: [
      "Used Jira and other tools to plan, track, and prioritize IT tasks efficiently.",
      "Coordinated with cross-functional teams to streamline workflows and ensure timely delivery.",
      "Monitored task progress, dependencies, and blockers to maintain operational efficiency.",
      "Leveraged technology to improve collaboration, visibility, and project outcomes.",
      "Aligned tool usage with team goals to support operational success and delivery.",
    ],
    From: new Date("2023-02-01"),
    To: new Date("2024-2-20"),
    Image: img.Concentrix,
  },
  {
    Place: "Planned Acts of Kindness",
    Role: "Web Developer",
    Description: [
      "Developed WordPress pages to expand the organization’s global reach.",
      "Created user-friendly, engaging pages that conveyed its mission and worldwide acts of kindness.",
      "Used these pages to spread awareness, garner support, and build community around the cause.",
      "Leveraged web development skills to amplify a benevolence-focused organization’s impact.",
      "Delivered accessible content that showcased transformative initiatives and inspired engagement.",
    ],
    From: new Date("2022-11-01"),
    To: new Date("2024-2-20"),
    Image: img.PAK,
  },
  {
    Place: "Idea Maker",
    Role: "Lead Designer",
    Description: [
      "Consolidated a new company identity that improved external perception with clients.",
      "Designed mobile applications reaching 10k+ weekly views and 2M+ downloads.",
      "Led a team of 4 responsible for all company media.",
      "Increased client partnerships through cohesive media and brand execution.",
      "Expanded products into new clients/markets through design leadership.",
    ],
    From: new Date("2020-03-01"),
    To: new Date("2022-10-20"),
    Image: img.IdeaMaker,
  },
  {
    Place: "LIQ",
    Description: [
      "Provided top-notch bilingual technical support in English and Portuguese."
      "Resolved technical issues and assisted users with operating systems, productivity apps, and hardware."
      "Used incident management tools to ensure fast, accurate support."
      "Delivered user training, how-to documentation, and support project management."
      "Built positive user relationships and collaborated with analysts to provide exceptional service."
   ],
    Role: "Bilingual Tech Support",
    From: new Date("2017-03-01"),
    To: new Date("2019-11-20"),
    Image: img.LIQ,
  },
];
