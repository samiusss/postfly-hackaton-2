import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Twitter, Instagram, Facebook, Calendar as CalendarIcon, Upload, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const platforms = [
  { 
    id: "twitter", 
    name: "Twitter (X)", 
    icon: Twitter,
    promptTemplate: (baseContent: string) => 
      `Generate a Twitter/X post based on this idea: "${baseContent}". 
       Keep it under 280 characters, make it engaging, and include 2-3 relevant hashtags. 
       Focus on brevity and virality. Include emojis where appropriate.`
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: Instagram,
    promptTemplate: (baseContent: string) => 
      `Generate an Instagram caption based on this idea: "${baseContent}". 
       Include relevant emojis, make it engaging and personal, and add 5-7 relevant hashtags at the end. 
       Focus on storytelling and visual description. Encourage engagement with a question.`
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    icon: Facebook,
    promptTemplate: (baseContent: string) => 
      `Generate a Facebook post based on this idea: "${baseContent}". 
       Focus on longer-form storytelling and personal connection. 
       Include 1-2 relevant hashtags if appropriate. Make it conversational and engaging.`
  },
];

interface PlatformContent {
  platform: string;
  content: string;
  isGenerating: boolean;
}

const MAX_CHARS = 280;

export default function Dashboard() {
  const [baseContent, setBaseContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformContents, setPlatformContents] = useState<PlatformContent[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const { toast } = useToast();

  const generateContentForPlatform = async (platform: string, content: string) => {
    try {
      const platformConfig = platforms.find(p => p.id === platform);
      if (!platformConfig) throw new Error("Platform not found");

      const prompt = platformConfig.promptTemplate(content);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error(`Generation error for ${platform}:`, error);
      throw error;
    }
  };

  const generateContent = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform to generate content.",
        variant: "destructive",
      });
      return;
    }

    // Initialize or update platform contents
    const updatedContents = selectedPlatforms.map(platform => ({
      platform,
      content: "",
      isGenerating: true
    }));
    setPlatformContents(updatedContents);

    // Generate content for each platform in parallel
    try {
      const results = await Promise.all(
        selectedPlatforms.map(async platform => {
          try {
            const generatedContent = await generateContentForPlatform(platform, baseContent);
            return {
              platform,
              content: generatedContent,
              isGenerating: false
            };
          } catch (error) {
            return {
              platform,
              content: "Error generating content. Please try again.",
              isGenerating: false
            };
          }
        })
      );

      setPlatformContents(results);
      toast({
        title: "Content Generated",
        description: "Platform-specific content has been generated!",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scheduleContent = async () => {
    setIsScheduling(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsScheduling(false);
    toast({
      title: "Content Scheduled",
      description: `Your posts have been scheduled for ${scheduleDate?.toLocaleDateString()}`,
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId];
      
      // Update platform contents based on selection
      setPlatformContents(current => 
        current.filter(content => 
          newPlatforms.includes(content.platform)
        )
      );
      
      return newPlatforms;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
      toast({
        title: "Media Added",
        description: `File "${e.target.files[0].name}" has been added to your posts`,
      });
    }
  };

  const handlePost = async () => {
    toast({
      title: "Posts Sent!",
      description: "Your content has been posted successfully to the selected platforms.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Social Media Dashboard</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex flex-wrap gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.id}
                  className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <Checkbox
                    id={platform.id}
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => handlePlatformToggle(platform.id)}
                  />
                  <label htmlFor={platform.id} className="flex items-center space-x-2 cursor-pointer">
                    <Icon className="w-5 h-5" />
                    <span>{platform.name}</span>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {mediaFile && (
              <div className="text-sm text-gray-500">
                Selected file: {mediaFile.name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Write your base content here or generate platform-specific content..."
              value={baseContent}
              onChange={(e) => setBaseContent(e.target.value)}
              className="min-h-[150px] resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={generateContent}
              disabled={platformContents.some(p => p.isGenerating)}
              className="bg-primary hover:bg-primary/90"
            >
              {platformContents.some(p => p.isGenerating) ? "Generating..." : "Generate Content"}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {scheduleDate ? scheduleDate.toLocaleDateString() : "Schedule"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduleDate}
                  onSelect={setScheduleDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              onClick={scheduleContent}
              disabled={!baseContent || selectedPlatforms.length === 0 || !scheduleDate || isScheduling}
              className="bg-primary hover:bg-primary/90"
            >
              {isScheduling ? "Scheduling..." : "Schedule Posts"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 transform hover:scale-105"
                  disabled={!baseContent || selectedPlatforms.length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Now
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Posts</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to post this content to {selectedPlatforms.length} platform(s)?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePost}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Yes, Post Now
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {selectedPlatforms.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Platform Previews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformContents.map((content) => (
                <div key={content.platform} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2 capitalize">{content.platform}</h3>
                  {content.isGenerating ? (
                    <p className="text-gray-500">Generating content...</p>
                  ) : (
                    <p className="text-gray-600 text-sm mb-4 whitespace-pre-wrap">
                      {content.content || "Generate content to see preview"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}