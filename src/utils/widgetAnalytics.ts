import { supabase } from "@/integrations/supabase/client";

// Generate or retrieve session ID from sessionStorage
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const trackWidgetEvent = async (
  eventType: 'tooltip_shown' | 'whatsapp_clicked' | 'tooltip_dismissed_manual' | 'tooltip_dismissed_auto'
) => {
  try {
    await supabase.from('widget_analytics').insert({
      event_type: eventType,
      session_id: getSessionId(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.debug('Widget analytics tracking failed:', error);
  }
};
