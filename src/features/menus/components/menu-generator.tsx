"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useProtectedAction } from "@/hooks/use-protected-action";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { useGenerateMenu } from "../api/use-generate-menu";

interface Recipe {
  name: string;
  ingredients: Array<{ name: string; quantity: string }>;
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
}

interface MenuData {
  id: string;
  name: string;
  ingredients: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  createdAt: string;
  recipes: Recipe[];
}

export const MenuGenerator = () => {
  const { status } = useSession();
  const { checkAccess } = useProtectedAction({ requireSubscription: true });
  const [ingredients, setIngredients] = useState("");
  const [menuName, setMenuName] = useState("");
  const [generatedMenu, setGeneratedMenu] = useState<MenuData | null>(null);
  const mutation = useGenerateMenu();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication and subscription
    if (!checkAccess()) {
      return;
    }
    
    if (!ingredients.trim()) {
      toast.error("Please enter some ingredients");
      return;
    }

    mutation.mutate({
      ingredients,
      name: menuName || undefined
    }, {
      onSuccess: (response: any) => {
        toast.success("Menu generated successfully!");
        setGeneratedMenu(response.data as MenuData);
      },
      onError: (error: any) => {
        if (error.message?.includes("SUBSCRIPTION_REQUIRED")) {
          toast.error("Active subscription required", {
            description: "Please upgrade to Pro to generate AI menus",
            action: {
              label: "Upgrade",
              onClick: () => window.location.href = "/subscription",
            },
          });
        } else {
          toast.error(error.message || "Failed to generate menu");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>AI Menu Generator</CardTitle>
          <CardDescription>
            Enter your ingredients and get a nutritionally balanced menu with recipes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="menuName">Menu Name (Optional)</Label>
              <Input
                id="menuName"
                placeholder="e.g., Monday Fitness Menu"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                placeholder="Enter your ingredients separated by commas (e.g., chicken breast, quinoa, broccoli, avocado)"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={6}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Tip: The more specific you are with your ingredients, the better the menu will be tailored to your needs.</p>
            </div>
            
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Generating..." : "Generate Menu"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Display Generated Menu */}
      {generatedMenu && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{generatedMenu.name}</CardTitle>
            <CardDescription>
              Generated on {new Date(generatedMenu.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nutrition Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Nutritional Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-2xl font-bold">{generatedMenu.protein}g</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-2xl font-bold">{generatedMenu.carbs}g</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Fat</p>
                  <p className="text-2xl font-bold">{generatedMenu.fat}g</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p className="text-2xl font-bold">{generatedMenu.calories}</p>
                </div>
              </div>
            </div>

            {/* Recipes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recipes</h3>
              <div className="space-y-6">
                {generatedMenu.recipes?.map((recipe, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-xl">{recipe.name}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{recipe.prepTime} min prep</Badge>
                        <Badge variant="outline">{recipe.cookTime} min cook</Badge>
                        <Badge variant="outline">{recipe.servings} servings</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Ingredients:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {recipe.ingredients.map((ing, i) => (
                            <li key={i} className="text-sm">
                              {ing.name} - {ing.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Instructions:</h4>
                        <ol className="list-decimal list-inside space-y-1">
                          {recipe.instructions.map((step, i) => (
                            <li key={i} className="text-sm">{step}</li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};