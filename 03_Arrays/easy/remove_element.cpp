// ========================================================
// Problem: Remove Element
// Link: https://leetcode.com/problems/remove-element/submissions/2166205384/
// Date: 2026-10-08
// Striver's A2Z DSA Sheet Solution
// ========================================================

class Solution {
public:
    int removeElement(vector<int>& nums, int val) {
       int k=0;
       for(int i=0;i<nums.size();i++){
        if(nums[i]!=val){
            nums[k]=nums[i];
            k++;
        }
       }
       return k;
    }
};