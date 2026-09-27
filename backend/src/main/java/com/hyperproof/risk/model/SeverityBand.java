package com.hyperproof.risk.model;

public enum SeverityBand {
    Low(1, 5, "#10B981", "bg-emerald-100 text-emerald-800 border-emerald-300"),
    Medium(6, 12, "#F59E0B", "bg-amber-100 text-amber-800 border-amber-300"),
    High(13, 19, "#F97316", "bg-orange-100 text-orange-800 border-orange-300"),
    Critical(20, 25, "#EF4444", "bg-rose-100 text-rose-800 border-rose-300");

    private final int minScore;
    private final int maxScore;
    private final String hexColor;
    private final String tailwindClass;

    SeverityBand(int minScore, int maxScore, String hexColor, String tailwindClass) {
        this.minScore = minScore;
        this.maxScore = maxScore;
        this.hexColor = hexColor;
        this.tailwindClass = tailwindClass;
    }

    public int getMinScore() {
        return minScore;
    }

    public int getMaxScore() {
        return maxScore;
    }

    public String getHexColor() {
        return hexColor;
    }

    public String getTailwindClass() {
        return tailwindClass;
    }

    public static SeverityBand fromScore(int score) {
        if (score <= 5) {
            return Low;
        } else if (score <= 12) {
            return Medium;
        } else if (score <= 19) {
            return High;
        } else {
            return Critical;
        }
    }
}
