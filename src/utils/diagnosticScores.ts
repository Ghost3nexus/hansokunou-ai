export const calculateDiagnosticScores = (analysisData: any): {
  sns_score: number;
  structure_score: number;
  ux_score: number;
  app_score: number;
  theme_score: number;
} => {
  const scores = {
    sns_score: 0,
    structure_score: 0,
    ux_score: 0,
    app_score: 0,
    theme_score: 0
  };
  
  if (!analysisData) return scores;
  
  if (analysisData.social_links) {
    let snsScore = 0;
    if (analysisData.social_links.instagram) snsScore += 30;
    if (analysisData.social_links.twitter) snsScore += 20;
    
    if (analysisData.social_links.activity) {
      if (analysisData.social_links.activity.hashtags && analysisData.social_links.activity.hashtags.length > 0) {
        snsScore += Math.min(20, analysisData.social_links.activity.hashtags.length * 5);
      }
      if (analysisData.social_links.activity.instagram_posts) snsScore += 15;
      if (analysisData.social_links.activity.twitter_followers) snsScore += 15;
    }
    
    scores.sns_score = Math.min(100, snsScore);
  }
  
  if (analysisData.competitor_summary) {
    let structureScore = 0;
    const cs = analysisData.competitor_summary;
    
    if (cs.product_count > 0) {
      structureScore += Math.min(30, cs.product_count * 3);
    }
    
    if (cs.category_count > 0) {
      structureScore += Math.min(40, cs.category_count * 5);
    }
    
    if (cs.collections && cs.collections.length > 0) {
      structureScore += Math.min(30, cs.collections.length * 6);
    }
    
    scores.structure_score = Math.min(100, structureScore);
  }
  
  if (analysisData.competitor_summary && analysisData.competitor_summary.dom_elements) {
    let uxScore = 0;
    const dom = analysisData.competitor_summary.dom_elements;
    const features = analysisData.competitor_summary.features || {};
    
    if (dom.add_to_cart) uxScore += 20;
    if (dom.buy_now) uxScore += 15;
    if (dom.product_variants) uxScore += 15;
    if (dom.product_description) uxScore += 15;
    if (dom.product_images) uxScore += 15;
    
    if (features.search) uxScore += 5;
    if (features.cart) uxScore += 5;
    if (features.reviews) uxScore += 5;
    if (features.wishlist) uxScore += 5;
    
    scores.ux_score = Math.min(100, uxScore);
  }
  
  if (analysisData.competitor_summary && analysisData.competitor_summary.apps) {
    const apps = analysisData.competitor_summary.apps;
    scores.app_score = Math.min(100, apps.length * 20);
  }
  
  if (analysisData.competitor_summary && analysisData.competitor_summary.theme) {
    let themeScore = 70; // Base score for having a detectable theme
    const theme = analysisData.competitor_summary.theme.toLowerCase();
    
    if (theme !== "unknown") {
      themeScore += 20;
      
      if (['dawn', 'expanse', 'refresh', 'sense'].includes(theme)) {
        themeScore += 10;
      }
    }
    
    scores.theme_score = Math.min(100, themeScore);
  }
  
  return scores;
};

export const generateTags = (analysisData: any): string[] => {
  const tags: string[] = [];
  
  if (!analysisData) return tags;
  
  tags.push('EC分析');
  
  if (analysisData.competitor_summary) {
    const cs = analysisData.competitor_summary;
    
    if (cs.page_type) {
      tags.push(`${cs.page_type}ページ`);
    }
    
    if (cs.product_count > 0) {
      tags.push('商品あり');
    }
    
    if (cs.category_count > 0) {
      tags.push('カテゴリー構造');
    }
    
    if (cs.features) {
      if (cs.features.search) tags.push('検索機能');
      if (cs.features.reviews) tags.push('レビュー機能');
      if (cs.features.cart) tags.push('カート機能');
    }
    
    if (cs.theme && cs.theme !== "Unknown") {
      tags.push(`テーマ:${cs.theme}`);
    }
    
    if (cs.apps && cs.apps.length > 0) {
      tags.push('アプリあり');
      const importantApps = ['Klaviyo', 'Judge.me', 'Yotpo', 'ReCharge'];
      cs.apps.forEach((app: string) => {
        if (importantApps.includes(app)) {
          tags.push(`App:${app}`);
        }
      });
    }
  }
  
  if (analysisData.social_links) {
    if (analysisData.social_links.instagram) tags.push('Instagram');
    if (analysisData.social_links.twitter) tags.push('Twitter');
  }
  
  return tags;
};
