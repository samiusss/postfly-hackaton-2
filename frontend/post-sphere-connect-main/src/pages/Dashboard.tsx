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
import { platformRules } from "@/utils/platformRules";

const platforms = [
    { id: "twitter", name: "Twitter (X)", icon: Twitter },
    { id: "instagram", name: "Instagram", icon: Instagram },
    { id: "facebook", name: "Facebook", icon: Facebook },
];
const MAX_CHARS = 280;
const GEMINI_API_KEY = "AIzaSyDRjp8zjGlydOImv-OhWAcj3JHHNGZ14b0";

export default function Dashboard() {
    const { toast } = useToast();

    // State for user-entered text in the Textarea
    const [content, setContent] = useState("");

    // State for storing platform-specific AI-generated content
    const [platformContents, setPlatformContents] = useState<Record<string, string>>({});

    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleDate, setScheduleDate] = useState<Date>();
    const [mediaFile, setMediaFile] = useState<File | null>(null);

    // Simple parsing based on platform-specific constraints
    const parseGeneratedContent = (raw: string, platform: string) => {
        const sections = raw.split(/\n{2,}/);

        switch (platform) {
            case "twitter":
                // pick the first non-empty section
                return sections.find((section) => section.trim()) || "";

            case "instagram":
                // combine all sections with double line breaks
                return sections.filter(Boolean).join("\n\n");

            case "facebook":
                // combine all sections with single line breaks
                return sections.filter(Boolean).join("\n");

            default:
                return raw;
        }
    };

    /**
     * Generate AI content for each selected platform individually.
     * We store each platform’s result into `platformContents`.
     */
    const generateContent = async () => {
        if (selectedPlatforms.length === 0) return;

        setIsGenerating(true);

        try {
            // We'll create a local copy so we can update them in one setState
            const newPlatformContents: Record<string, string> = {};

            for (const platformId of selectedPlatforms) {
                const platform = platforms.find((p) => p.id === platformId);
                if (!platform) continue;

                const rules = platformRules[platformId];

                // Make an API call for this specific platform
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        {
                                            text: `Generate a social media post specifically for ${
                                                platform.name
                                            }.
Requirements:
- Follow ${platform.name}'s best practices
- Maximum length: ${rules.maxLength} characters
- Maximum hashtags: ${rules.hashtagLimit}
- Content guidelines: ${rules.contentGuidelines.join(", ")}
- Theme: ${content || "general topic"}
- Use emojis: ${rules.formatting.emojiRecommended ? "Yes" : "Sparingly"}
- Line breaks: ${rules.formatting.lineBreaksAllowed ? "Allowed" : "Minimal"}
Output: Plain text only, optimized for ${platform.name}'s format.`,
                                        },
                                    ],
                                },
                            ],
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error(`Content generation failed for ${platform.name}`);
                }

                // Get the raw text from the model
                const data = await response.json();
                const rawGenerated = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

                // Parse it to match the platform constraints
                const parsed = parseGeneratedContent(rawGenerated, platformId);

                // Store the parsed content for this platform
                newPlatformContents[platformId] = parsed;
            }

            // Update the platformContents state in one go
            setPlatformContents(newPlatformContents);

            toast({
                title: "Content Generated",
                description: "Platform-specific content created successfully!",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to generate content",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const scheduleContent = async () => {
        setIsScheduling(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast({
                title: "Content Scheduled",
                description: `Post scheduled for ${scheduleDate?.toLocaleDateString()}`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Scheduling failed",
                variant: "destructive",
            });
        } finally {
            setIsScheduling(false);
        }
    };

    // Publishing the content
    const handlePost = async () => {
        try {
            // Demo only
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast({
                title: "Post Published!",
                description: `Content posted to ${selectedPlatforms.length} platform(s)`,
            });

            // Clear everything
            setContent("");
            setMediaFile(null);
            setSelectedPlatforms([]);
            setPlatformContents({});
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to publish post",
                variant: "destructive",
            });
        }
    };

    const handlePlatformToggle = (platformId: string) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platformId)
                ? prev.filter((id) => id !== platformId)
                : [...prev, platformId]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMediaFile(e.target.files[0]);
            toast({
                title: "Media Added",
                description: `File "${e.target.files[0].name}" added to post`,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Social Media Dashboard</h1>

                {/* Card with platform selection, content input, scheduling, etc. */}
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    {/* Platform Selection */}
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
                                    <label
                                        htmlFor={platform.id}
                                        className="flex items-center space-x-2 cursor-pointer"
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{platform.name}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    {/* Media file input */}
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

                    {/* Manual post content input */}
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Write your own post here, or generate AI content..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[150px] resize-none"
                            maxLength={MAX_CHARS}
                        />
                        <div className="text-right text-sm text-gray-500">
                            {content.length}/{MAX_CHARS} characters
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-4">
                        <Button
                            onClick={generateContent}
                            disabled={isGenerating || selectedPlatforms.length === 0}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isGenerating ? "Generating..." : "Generate AI Content"}
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
                            disabled={
                                !content ||
                                selectedPlatforms.length === 0 ||
                                !scheduleDate ||
                                isScheduling
                            }
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isScheduling ? "Scheduling..." : "Schedule Post"}
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 transform hover:scale-105"
                                    disabled={
                                        !content && Object.values(platformContents).every((v) => !v)
                                    }
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Post Now
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Publication</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to publish this content to{" "}
                                        {selectedPlatforms.length} platform(s)? This action cannot
                                        be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handlePost}
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                        Confirm Publication
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Previews */}
                {selectedPlatforms.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">Content Preview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedPlatforms.map((platformId) => {
                                const platformData = platformContents[platformId];
                                const platformLabel =
                                    platforms.find((p) => p.id === platformId)?.name || platformId;

                                return (
                                    <div
                                        key={platformId}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <h3 className="text-lg font-semibold mb-2">
                                            {platformLabel}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 whitespace-pre-wrap">
                                            {/* Show the AI-generated platform content, or fallback to user input */}
                                            {platformData && platformData.trim() !== ""
                                                ? platformData
                                                : content || "Generated content will appear here"}
                                        </p>
                                        {/* (Optional) Button to refresh or forcibly re-generate platform content */}
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => generateContent()}
                                        >
                                            Refresh Preview
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
