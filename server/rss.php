<?php
/**
 * Dynamic RSS Feed Generator
 * Generates RSS feed for India Tech Atlas
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/rss+xml; charset=utf-8');

$baseUrl = APP_URL; // domain from config.php
$lastBuildDate = date('r');

$items = [
    [
        'title' => 'Past Hub: Foundations of Indian Tech',
        'link' => $baseUrl . '/past.html',
        'description' => 'Explore the institutions, policies, and pioneers that seeded India\'s computing, electronics, and space capabilities.',
        'pubDate' => 'Mon, 15 Jan 2024 00:00:00 +0530'
    ],
    [
        'title' => 'Present Pulse: India\'s Tech Momentum',
        'link' => $baseUrl . '/present.html',
        'description' => 'Track the living heartbeat of Indian technology—digital public infrastructure, unicorn creation, chipset ambitions, and SaaS champions going global.',
        'pubDate' => 'Mon, 15 Jan 2024 00:00:00 +0530'
    ],
    [
        'title' => 'Future Forge: Imagining India\'s Next Leap',
        'link' => $baseUrl . '/future.html',
        'description' => 'Craft speculative scenarios from quantum stacks to resilient climate tech. Tune moonshot ingredients and map how Bharat might engineer inclusive breakthroughs.',
        'pubDate' => 'Mon, 15 Jan 2024 00:00:00 +0530'
    ],
    [
        'title' => 'Games Lab: Interactive Indian Tech Playground',
        'link' => $baseUrl . '/games.html',
        'description' => 'Spin up startup mashups, test your instinct on funding numbers, and unscramble desi tech terms. Everything celebrates the creativity powering India\'s tech boom.',
        'pubDate' => 'Mon, 15 Jan 2024 00:00:00 +0530'
    ]
];

?>
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>India Tech Atlas</title>
    <link><?php echo htmlspecialchars($baseUrl, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); ?></link>
    <description>Explore India's tech ecosystem across past, present, and future eras with interactive games and insights.</description>
    <language>en-IN</language>
    <lastBuildDate><?php echo $lastBuildDate; ?></lastBuildDate>
    <atom:link href="<?php echo htmlspecialchars($baseUrl, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); ?>/server/rss.php" rel="self" type="application/rss+xml"/>

    <?php foreach ($items as $item): ?>
    <item>
      <title><?php echo htmlspecialchars($item['title']); ?></title>
      <link><?php echo htmlspecialchars($item['link']); ?></link>
      <description><?php echo htmlspecialchars($item['description']); ?></description>
      <pubDate><?php echo $item['pubDate']; ?></pubDate>
      <guid><?php echo htmlspecialchars($item['link']); ?></guid>
    </item>
    <?php endforeach; ?>

  </channel>
</rss>

