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
  { id: "twitter", name: "Twitter (X)", icon: Twitter },
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "facebook", name: "Facebook", icon: Facebook },
];

const MAX_CHARS = 280;

export default function Dashboard() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [preview, setPreview] = useState<{ platform: string; content: string; previewHtml: string } | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const { toast } = useToast();

  const generateContent = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setContent("This is an AI-generated post optimized for multiple platforms");
    setIsGenerating(false);
    toast({
      title: "Content Generated",
      description: "Your AI-optimized content is ready!",
    });
  };

  const scheduleContent = async () => {
    setIsScheduling(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsScheduling(false);
    toast({
      title: "Content Scheduled",
      description: `Your post has been scheduled for ${scheduleDate?.toLocaleDateString()}`,
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  const handlePreview = async (platform: string) => {
    const mockPreview = {
      platform,
      content,
      previewHtml: `<div class="preview-content">${content}</div>`,
    };
    setPreview(mockPreview);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
      toast({
        title: "Media Added",
        description: `File "${e.target.files[0].name}" has been added to your post`,
      });
    }
  };

  const handlePost = async () => {
    toast({
      title: "Post Sent!",
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
              placeholder="Write your post here or generate content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={MAX_CHARS}
            />
            <div className="text-right text-sm text-gray-500">
              {content.length}/{MAX_CHARS} characters
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={generateContent}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? "Generating..." : "Generate Content"}
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
              disabled={!content || selectedPlatforms.length === 0 || !scheduleDate || isScheduling}
              className="bg-primary hover:bg-primary/90"
            >
              {isScheduling ? "Scheduling..." : "Schedule Post"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 transform hover:scale-105"
                  disabled={!content || selectedPlatforms.length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Now
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Post</AlertDialogTitle>
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
            <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPlatforms.map((platform) => (
                <div key={platform} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2 capitalize">{platform}</h3>
                  <p className="text-gray-600 text-sm mb-4">{content || "Your post preview will appear here"}</p>
                  <Button
                    onClick={() => handlePreview(platform)}
                    variant="outline"
                    className="w-full"
                  >
                    Refresh Preview
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}