/**
 * routes/interview.routes.js
 * ──────────────────────────────────────────────────────────────────────────
 * POST /interview-questions/
 * Returns { q, a, difficulty, company?, source? } — exact shape that
 * InterviewPrep.js QCard component expects.
 * ──────────────────────────────────────────────────────────────────────────
 */

"use strict";

const express = require("express");
const router  = express.Router();

// ── Question bank ──────────────────────────────────────────────────────────
const QUESTION_BANK = {

  "data analyst": {
    theoretical: [
      { q:"What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?", difficulty:"Easy", company:"Amazon", source:"InterviewBit",
        a:`INNER JOIN — returns only rows where there is a match in BOTH tables.
LEFT JOIN  — returns ALL rows from the left table + matching rows from the right (NULLs where no match).
FULL OUTER — returns ALL rows from BOTH tables (NULLs where there is no match on either side).

Example:
  Employees (id, name) | Departments (emp_id, dept)
  INNER JOIN → only employees who have a department
  LEFT JOIN  → all employees, NULL dept if unassigned
  FULL OUTER → all employees + all departments, NULLs where no link` },

      { q:"Explain the difference between OLTP and OLAP systems.", difficulty:"Medium", company:"Google", source:"GeeksforGeeks",
        a:`OLTP (Online Transaction Processing):
  - Handles real-time day-to-day transactions (INSERT/UPDATE/DELETE)
  - Highly normalised schema (3NF) for data integrity
  - Many small, fast queries
  - Examples: banking systems, e-commerce orders

OLAP (Online Analytical Processing):
  - Handles complex analytical queries on historical data
  - Denormalised / star-schema design for query speed
  - Few large, slow queries (aggregations, GROUP BY, window functions)
  - Examples: data warehouses — Snowflake, Redshift, BigQuery

Key rule: you EXTRACT from OLTP and LOAD into OLAP via ETL pipelines.` },

      { q:"What is data normalisation? Explain 1NF, 2NF, and 3NF with examples.", difficulty:"Medium", company:"Microsoft", source:"PrepInsta",
        a:`Normalisation removes redundancy and ensures data integrity.

1NF — Each column has atomic (indivisible) values, no repeating groups.
  Violation: storing phone numbers as "9876543210, 9123456789" in one cell.
  Fix: split into separate rows.

2NF — Must be in 1NF + every non-key column depends on the ENTIRE primary key.
  Applies only to composite keys. Partial dependency = violation.
  Fix: move partially dependent columns to a separate table.

3NF — Must be in 2NF + no transitive dependencies.
  Violation: Orders(order_id, customer_id, customer_city)
  customer_city depends on customer_id, not order_id.
  Fix: move customer_city to a Customers table.` },

      { q:"How do you handle missing values in a dataset? What are the trade-offs of each method?", difficulty:"Medium", company:"Flipkart", source:"InterviewBit",
        a:`1. Delete rows — only safe when < 5% missing at random (MCAR). Loses data.

2. Mean/Median/Mode imputation:
   - Mean: normally distributed numerical data
   - Median: skewed data (robust to outliers)
   - Mode: categorical data
   Trade-off: reduces variance, can distort relationships between variables.

3. Forward/backward fill — best for time-series where previous value is meaningful.

4. KNN Imputation — uses k nearest neighbours to estimate missing value.
   More accurate but computationally expensive on large datasets.

5. Model-based imputation — train a regression model on complete rows to predict missing values.
   Best accuracy, most complex.

6. Create a "missing" indicator column — flag the missingness itself as a feature.
   Sometimes WHY data is missing is more informative than the value itself.

Best practice: First understand WHY data is missing (MCAR / MAR / MNAR) before choosing a strategy.` },

      { q:"What is the difference between correlation and causation? Give a real-world example.", difficulty:"Easy", company:"Walmart", source:"GeeksforGeeks",
        a:`Correlation: two variables tend to move together statistically.
Causation: one variable directly CAUSES the other to change.

Classic example:
  Ice cream sales and drowning rates are positively correlated.
  But ice cream does NOT cause drowning.
  The confounding variable is hot weather: heat → people swim more + buy more ice cream.

Why it matters in analytics:
  "Users who open the app more often have higher retention" is correlation.
  Forcing all users to open the app more (via spam notifications) may REDUCE retention.
  Engagement is likely a SYMPTOM of users already finding value, not the cause.

How to establish causation:
  - A/B testing (randomised controlled experiment) — gold standard
  - Instrumental variable analysis
  - Difference-in-differences
  - Regression discontinuity design` },

      { q:"What is a p-value? What does p < 0.05 actually mean and what are common misinterpretations?", difficulty:"Hard", company:"Meta", source:"InterviewBit",
        a:`A p-value is the probability of observing your result (or something more extreme) ASSUMING the null hypothesis is true.

p < 0.05 means: if there was truly no effect, you'd see a result this extreme less than 5% of the time by chance.

Common misinterpretations:
  ✗ "There is a 95% chance my hypothesis is true" — WRONG
  ✗ "The effect size is large or practically significant" — WRONG
  ✗ "The result will definitely replicate" — WRONG

Pitfalls:
  - p-hacking: running many tests until one gives p < 0.05 by chance
  - Underpowered studies: too small a sample → high false negative rate
  - Statistical vs practical significance: p = 0.001 but effect size is 0.001% improvement

Better practice: report effect size (Cohen's d, relative lift) + confidence intervals alongside p-values.` },

      { q:"What is the difference between a dimension table and a fact table in a star schema?", difficulty:"Easy", company:"Infosys", source:"PrepInsta",
        a:`Fact table:
  - Contains QUANTITATIVE, measurable data (metrics)
  - Examples: sales_amount, units_sold, revenue, clicks, page_views
  - Has foreign keys linking to all dimension tables
  - Usually very large (millions to billions of rows)
  - Types: additive, semi-additive, non-additive

Dimension table:
  - Contains DESCRIPTIVE, contextual attributes
  - Examples: product_name, customer_city, date, category, region
  - Usually smaller and slower-changing
  - SCD Type 1: overwrite changes | SCD Type 2: keep full history

Star schema:
  Fact_Sales — FK→ Dim_Product, Dim_Customer, Dim_Date, Dim_Store

Snowflake schema = star schema where dimension tables are further normalised.` },

      { q:"A Power BI dashboard is loading very slowly. How do you diagnose and fix it?", difficulty:"Hard", company:"Accenture", source:"GeeksforGeeks",
        a:`Diagnosis:
1. Use Performance Analyzer (View → Performance Analyzer):
   Shows DAX query time vs visual rendering time vs other.

2. Check data model:
   - Many-to-many relationships? Use a bridge table instead.
   - Schema too wide (100+ columns)? Remove unused columns at source.
   - Calculated columns vs measures: always prefer measures over calculated columns.

3. Audit DAX measures:
   - Replace slow iterators (SUMX, AVERAGEX) with aggregations where possible.
   - Use CALCULATE with explicit filters rather than implicit context modification.

4. Data volume:
   - Aggregate at source before importing (push computation to SQL).
   - Use Incremental Refresh instead of full refresh.
   - Use Aggregation tables for large fact tables.

5. Visual complexity:
   - Too many visuals on one page forces multiple DAX queries simultaneously.
   - Use bookmarks and hidden pages to reduce active visual count.

6. Storage mode:
   - Import mode is faster for analytics than DirectQuery.
   - Consider Composite Model: import large facts, DirectQuery small dimension tables.` },
    ],

    aptitude: [
      { q:"A table has 10,000 rows. After removing duplicates, 2,500 rows remain. What percentage were duplicates?", difficulty:"Easy", source:"IndiaBix",
        a:`Duplicate rows = 10,000 - 2,500 = 7,500
Duplicate percentage = (7,500 / 10,000) × 100 = 75%

Answer: 75% of the rows were duplicates.` },

      { q:"A SQL query runs in 4 seconds for 1,000 rows. Estimate the time for 1 million rows assuming linear complexity.", difficulty:"Easy", source:"PrepInsta",
        a:`Scale factor = 1,000,000 / 1,000 = 1,000
Estimated time = 4 × 1,000 = 4,000 seconds ≈ 66.7 minutes

In practice, adding an index can reduce this from O(n) to O(log n), bringing 1M rows closer to the original 4 seconds.` },

      { q:"Monthly sales: Jan=120, Feb=95, Mar=140, Apr=110, May=160, Jun=130. Calculate the 3-month moving average for June.", difficulty:"Medium", source:"IndiaBix",
        a:`3-month moving average for June uses April, May, June:
= (110 + 160 + 130) / 3 = 400 / 3 = 133.3

Moving averages smooth short-term volatility to reveal the underlying trend.` },

      { q:"Revenue grew from ₹40 lakhs to ₹70 lakhs. What is the percentage growth?", difficulty:"Easy", source:"IndiaBix",
        a:`Growth % = ((70 - 40) / 40) × 100 = (30 / 40) × 100 = 75%` },

      { q:"Set A has 60 elements, Set B has 80 elements, and their intersection has 20 elements. What is |A∪B|?", difficulty:"Medium", source:"PrepInsta",
        a:`|A∪B| = |A| + |B| - |A∩B| = 60 + 80 - 20 = 120

This is important in analytics when counting distinct users who did action A OR action B (avoiding double-counting users who did both).` },

      { q:"The mean of 6 numbers is 25. One number is removed and the new mean becomes 24. What was the removed number?", difficulty:"Medium", source:"IndiaBix",
        a:`Sum of 6 numbers = 6 × 25 = 150
Sum of 5 remaining = 5 × 24 = 120
Removed number = 150 - 120 = 30` },

      { q:"A column has 500 nulls out of 4,000 records. Is this null rate acceptable for imputation?", difficulty:"Easy", source:"PrepInsta",
        a:`Null rate = (500 / 4,000) × 100 = 12.5%

Guidelines:
  < 5%:   Safe to impute with mean/median/mode
  5–15%:  Use with caution; investigate why data is missing (MCAR/MAR/MNAR)
  15–40%: High bias risk; consider creating a "missing" indicator feature
  > 40%:  Column may not be usable; consider dropping

At 12.5%, investigate the missing pattern before imputing.` },

      { q:"A pipeline processes 8,000 records per hour. How long to process 300,000 records? Express in hours and minutes.", difficulty:"Easy", source:"IndiaBix",
        a:`Time = 300,000 / 8,000 = 37.5 hours = 37 hours 30 minutes` },
    ],

    coding: [
      { q:"Write a SQL query to find the second highest salary from an Employees table.", difficulty:"Medium", company:"Amazon", source:"LeetCode",
        a:`-- Method 1: Subquery
SELECT MAX(salary) AS second_highest
FROM Employees
WHERE salary < (SELECT MAX(salary) FROM Employees);

-- Method 2: DENSE_RANK (handles ties correctly — preferred)
SELECT salary AS second_highest
FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM Employees
) t
WHERE rnk = 2
LIMIT 1;

-- DENSE_RANK vs ROW_NUMBER: if two people tie for 1st, DENSE_RANK gives both rank 1
-- and the next person rank 2. ROW_NUMBER would arbitrarily give one rank 2.` },

      { q:"Write a SQL query to find all duplicate email addresses in a Users table.", difficulty:"Easy", company:"Facebook", source:"LeetCode",
        a:`-- Find emails appearing more than once
SELECT email, COUNT(*) AS occurrences
FROM Users
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY occurrences DESC;

-- To delete duplicates, keeping only the lowest ID per email:
DELETE FROM Users
WHERE id NOT IN (
  SELECT MIN(id)
  FROM Users
  GROUP BY email
);` },

      { q:"Write SQL to find the top 3 products by total revenue per region.", difficulty:"Hard", company:"Flipkart", source:"InterviewBit",
        a:`WITH ranked AS (
  SELECT
    region,
    product_id,
    SUM(revenue) AS total_revenue,
    RANK() OVER (PARTITION BY region ORDER BY SUM(revenue) DESC) AS rnk
  FROM Sales
  GROUP BY region, product_id
)
SELECT region, product_id, total_revenue
FROM ranked
WHERE rnk <= 3
ORDER BY region, rnk;

-- Use DENSE_RANK if you want ties both to appear in top 3.
-- Use ROW_NUMBER for exactly 3 rows per region regardless of ties.` },

      { q:"Write a Python function to compute a moving average for a given window size.", difficulty:"Medium", company:"Goldman Sachs", source:"GeeksforGeeks",
        a:`def moving_average(data, window):
    result = [None] * (window - 1)
    for i in range(window - 1, len(data)):
        result.append(sum(data[i - window + 1:i + 1]) / window)
    return result

# [None, None, 20.0, 30.0, 40.0, 50.0] for window=3
print(moving_average([10, 20, 30, 40, 50, 60], 3))

# Pandas (production):
import pandas as pd
pd.Series([10,20,30,40,50,60]).rolling(3).mean()` },

      { q:"Write SQL to find employees earning more than the average salary in their own department.", difficulty:"Medium", company:"Wipro", source:"PrepInsta",
        a:`WITH dept_avg AS (
  SELECT department_id, AVG(salary) AS avg_salary
  FROM Employees
  GROUP BY department_id
)
SELECT e.emp_id, e.name, e.department_id, e.salary, da.avg_salary
FROM Employees e
JOIN dept_avg da ON e.department_id = da.department_id
WHERE e.salary > da.avg_salary
ORDER BY e.department_id, e.salary DESC;` },

      { q:"Write Python code to read a CSV, drop duplicates, and compute a correlation matrix with a heatmap.", difficulty:"Easy", company:"TCS", source:"GeeksforGeeks",
        a:`import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.read_csv('data.csv')
print(f"Before: {df.shape}")
df = df.drop_duplicates()
print(f"After:  {df.shape}")

corr = df.select_dtypes(include='number').corr()
print(corr.round(3))

sns.heatmap(corr, annot=True, cmap='coolwarm', center=0, fmt='.2f')
plt.title('Correlation Matrix')
plt.tight_layout()
plt.show()` },

      { q:"Write SQL to calculate month-over-month revenue growth percentage using window functions.", difficulty:"Hard", company:"Swiggy", source:"InterviewBit",
        a:`WITH monthly AS (
  SELECT DATE_TRUNC('month', order_date) AS month,
         SUM(revenue) AS revenue
  FROM Orders
  GROUP BY 1
)
SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month))
    / NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100, 2
  ) AS mom_growth_pct
FROM monthly
ORDER BY month;

-- NULLIF prevents division by zero if previous month revenue was 0.
-- LAG() gets the previous row's value in the window.` },

      { q:"Write a Python function to detect and remove outliers using the IQR method.", difficulty:"Medium", company:"Zomato", source:"GeeksforGeeks",
        a:`import pandas as pd

def remove_outliers_iqr(df, column):
    Q1, Q3 = df[column].quantile([0.25, 0.75])
    IQR    = Q3 - Q1
    lower  = Q1 - 1.5 * IQR
    upper  = Q3 + 1.5 * IQR

    mask    = df[column].between(lower, upper)
    removed = (~mask).sum()
    print(f"{column}: removed {removed} outliers ({removed/len(df)*100:.1f}%)")
    return df[mask].reset_index(drop=True)

df = pd.DataFrame({'salary': [30000,35000,40000,42000,38000,500000,31000]})
df_clean = remove_outliers_iqr(df, 'salary')
print(df_clean)` },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  "software engineer": {
    theoretical: [
      { q:"What is the difference between a process and a thread?", difficulty:"Easy", company:"Google", source:"GeeksforGeeks",
        a:`Process: independent program with its own memory space.
  - Communication requires IPC (pipes, sockets, shared memory)
  - Crash doesn't affect other processes
  - Higher overhead to create

Thread: lightweight unit within a process, shares the same memory.
  - Much lower overhead to create
  - One crashing thread can bring down the whole process
  - Requires synchronisation (mutex, semaphore) to avoid race conditions

When to use:
  CPU-bound → multiple processes (avoids Python GIL)
  I/O-bound → threads or async/await` },

      { q:"Explain the SOLID principles with one example each.", difficulty:"Medium", company:"Microsoft", source:"InterviewBit",
        a:`S — Single Responsibility: A class should have only ONE reason to change.
  UserAuth class shouldn't also send emails.

O — Open/Closed: Open for extension, closed for modification.
  Add new payment methods by creating new classes, not editing PaymentProcessor.

L — Liskov Substitution: Subclasses must be substitutable for their parent.
  If Bird has fly(), a Penguin subclass violates LSP.

I — Interface Segregation: Don't force clients to implement interfaces they don't use.
  Split IWorker into IWorker + IEater so Robot doesn't implement eat().

D — Dependency Inversion: Depend on abstractions, not concretions.
  OrderService depends on IPaymentGateway, not on StripePaymentGateway directly.` },

      { q:"What is the CAP theorem? Give a real-world database example.", difficulty:"Hard", company:"Amazon", source:"GeeksforGeeks",
        a:`CAP: a distributed system can guarantee only TWO of three:

C — Consistency: every read gets the most recent write or an error.
A — Availability: every request gets a response (may not be the latest data).
P — Partition Tolerance: system keeps working even when network partitions occur.

Since partitions are unavoidable, the real choice is C vs A:

CP (Consistency over Availability):
  HBase, MongoDB, ZooKeeper
  Use case: banking, financial transactions

AP (Availability over Consistency):
  Cassandra, DynamoDB, CouchDB
  Use case: social media feeds, DNS, shopping cart
  Strategy: "eventual consistency" — data will converge over time.` },

      { q:"What is a race condition and how do you prevent it?", difficulty:"Medium", company:"Uber", source:"InterviewBit",
        a:`A race condition occurs when two threads access shared data concurrently and the outcome depends on execution order.

Example:
  Thread A reads balance = ₹100
  Thread B reads balance = ₹100
  Thread A adds ₹50, writes ₹150
  Thread B adds ₹30, writes ₹130  ← Thread A's update is lost!
  Expected: ₹180. Actual: ₹130.

Prevention:
  1. Mutex lock: only one thread holds the lock at a time
  2. Atomic DB operations: UPDATE balance = balance + 50 WHERE id = 1
  3. Optimistic locking: read a version number, update only if version unchanged
  4. Immutable data: never modify shared objects; always create new ones
  5. Message queue: serialise operations (Kafka, RabbitMQ)` },

      { q:"What is database indexing? When should you NOT use an index?", difficulty:"Medium", company:"Flipkart", source:"PrepInsta",
        a:`An index (usually a B-tree) speeds up reads at the cost of extra storage and slower writes.
Without index: full scan O(n). With index: B-tree lookup O(log n).

When TO index: columns in WHERE, JOIN ON, ORDER BY, GROUP BY, and foreign keys with high cardinality.

When NOT TO index:
  - Small tables (< 1,000 rows): full scan is faster
  - Low cardinality columns (e.g., boolean, gender): index rarely helps
  - Columns with very frequent INSERT/UPDATE/DELETE: index maintenance slows writes
  - Columns rarely used in queries

Composite index (a, b): helps queries filtering on a or (a,b) together, but NOT on b alone.` },
    ],

    aptitude: [
      { q:"For an array of 1,048,576 elements, how many comparisons does binary search need in the worst case?", difficulty:"Medium", source:"IndiaBix",
        a:`1,048,576 = 2^20
Binary search worst case = log₂(2^20) = 20 comparisons.
That's 20 steps to search 1 million elements vs 1,000,000 for linear search.` },

      { q:"A system achieves 99.9% uptime. How many minutes of downtime are allowed per year?", difficulty:"Easy", source:"PrepInsta",
        a:`Minutes/year = 365 × 24 × 60 = 525,600
Downtime = 525,600 × 0.001 = 525.6 minutes ≈ 8 hours 46 minutes

Common SLAs:
  99%    → 3.65 days/year
  99.9%  → 8.76 hours/year
  99.99% → 52.6 minutes/year
  99.999%→ 5.26 minutes/year` },

      { q:"An API handles 500 requests/sec, each taking 200ms. How many concurrent connections are needed minimum?", difficulty:"Hard", source:"IndiaBix",
        a:`Little's Law: L = λ × W
L = 500 req/sec × 0.2 sec = 100 concurrent connections minimum.

In practice configure 150–200 to handle burst traffic and queue buildup.` },
    ],

    coding: [
      { q:"Implement binary search on a sorted array. Return the index or -1 if not found.", difficulty:"Easy", company:"Microsoft", source:"LeetCode",
        a:`def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Time: O(log n) | Space: O(1)
print(binary_search([2,5,8,12,16,23,38,56,72,91], 23))  # → 5` },

      { q:"Detect a cycle in a linked list using Floyd's algorithm (tortoise and hare).", difficulty:"Medium", company:"Amazon", source:"LeetCode",
        a:`def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True     # Cycle detected
    return False            # Reached end → no cycle

# Time: O(n) | Space: O(1)
# Slow pointer moves 1 step, fast moves 2 steps.
# If there's a cycle, they MUST meet eventually.` },

      { q:"Implement an LRU Cache with O(1) get and put operations.", difficulty:"Hard", company:"Google", source:"LeetCode",
        a:`from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap   = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache: return -1
        self.cache.move_to_end(key)   # Mark as recently used
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)  # Evict LRU (front)

# Time: O(1) for both. OrderedDict uses doubly-linked list + hash map internally.` },

      { q:"Write a function to check if a string is a valid palindrome ignoring spaces and case.", difficulty:"Easy", company:"Apple", source:"LeetCode",
        a:`def is_palindrome(s):
    # Keep only alphanumeric, convert to lowercase
    cleaned = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]

# Two-pointer (O(1) space):
def is_palindrome_v2(s):
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():  left  += 1
        while left < right and not s[right].isalnum(): right -= 1
        if s[left].lower() != s[right].lower(): return False
        left += 1; right -= 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"))  # True` },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  "machine learning engineer": {
    theoretical: [
      { q:"Explain bias-variance tradeoff. How does it affect model selection?", difficulty:"Medium", company:"Google", source:"InterviewBit",
        a:`Bias: error from overly simplistic assumptions → underfitting.
  High training error AND high validation error.
  Example: linear regression on non-linear data.

Variance: error from excessive sensitivity to training data → overfitting.
  Low training error BUT high validation error.
  Example: deep decision tree with no max_depth.

Tradeoff: more complexity → lower bias + higher variance.

Reduce HIGH BIAS:
  Use more complex model, add more features, reduce regularisation.

Reduce HIGH VARIANCE:
  More training data, simpler model, more regularisation (L1/L2/Dropout), ensemble methods (Random Forest = bagging).` },

      { q:"What is the difference between L1 and L2 regularisation? When would you use each?", difficulty:"Hard", company:"Meta", source:"GeeksforGeeks",
        a:`L2 (Ridge): Penalty = λ × Σ(wᵢ²)
  - Shrinks all weights toward zero but never exactly zero
  - Retains all features with small weights (dense model)
  - Differentiable everywhere → easier optimisation
  - Best when: many features are all somewhat useful, multicollinearity present

L1 (Lasso): Penalty = λ × Σ|wᵢ|
  - Can drive weights to EXACTLY zero → automatic feature selection
  - Produces sparse models (some features eliminated)
  - Not differentiable at zero
  - Best when: suspect many features are irrelevant, want interpretability

Elastic Net = L1 + L2 combined → best of both worlds.` },

      { q:"What is gradient descent? Explain SGD, mini-batch GD, and Adam optimizer.", difficulty:"Medium", company:"Nvidia", source:"GeeksforGeeks",
        a:`Gradient descent minimises loss by moving in the direction of negative gradient.
w = w - α × ∇L(w), where α = learning rate.

Batch GD: uses ALL samples per step. Stable but slow and memory-heavy.

SGD: uses ONE random sample per step. Fast but very noisy → oscillates around minimum.

Mini-batch GD: uses a batch (32/64/128). Balance of speed and stability. Standard in practice.

Adam (Adaptive Moment Estimation):
  - Combines momentum (exponential moving average of gradients)
    + RMSProp (per-parameter adaptive learning rates)
  - Default optimizer for most deep learning
  - Hyperparameters: lr=0.001, β₁=0.9, β₂=0.999` },
    ],

    aptitude: [
      { q:"A model has 90% accuracy on a dataset where 90% of samples are class A. Is it a good model?", difficulty:"Medium", source:"IndiaBix",
        a:`No — this is the accuracy paradox (class imbalance problem).

A model that predicts class A for EVERY sample achieves 90% accuracy without learning anything.
Precision for class B = 0%, Recall for class B = 0%.

Better metrics: F1 Score, ROC-AUC, Matthews Correlation Coefficient.

Solutions: SMOTE (oversample minority), class_weight='balanced', optimise for F1/AUC.` },

      { q:"Training loss = 0.05, validation loss = 2.8. What is the problem and how do you fix it?", difficulty:"Easy", source:"PrepInsta",
        a:`This is overfitting (high variance).
Model memorised training data but fails to generalise.

Fixes:
  1. Get more training data (most effective)
  2. Add regularisation: L2, Dropout, Batch Normalisation
  3. Reduce model complexity: fewer layers, lower max_depth
  4. Early stopping: stop training when validation loss stops improving
  5. Data augmentation: artificially increase training set diversity` },
    ],

    coding: [
      { q:"Implement linear regression from scratch using only NumPy.", difficulty:"Medium", company:"Uber", source:"GeeksforGeeks",
        a:`import numpy as np

class LinearRegression:
    def __init__(self, lr=0.01, n_iter=1000):
        self.lr, self.n_iter = lr, n_iter
        self.w = self.b = None

    def fit(self, X, y):
        n, f = X.shape
        self.w = np.zeros(f); self.b = 0
        for _ in range(self.n_iter):
            y_hat = X @ self.w + self.b
            self.w -= self.lr * (X.T @ (y_hat - y)) / n
            self.b -= self.lr * np.mean(y_hat - y)

    def predict(self, X):
        return X @ self.w + self.b

    def mse(self, X, y):
        return np.mean((self.predict(X) - y) ** 2)` },

      { q:"Write a function to compute precision, recall, and F1 score without sklearn.", difficulty:"Easy", company:"Nvidia", source:"InterviewBit",
        a:`def metrics(y_true, y_pred):
    TP = sum(t==1 and p==1 for t,p in zip(y_true,y_pred))
    FP = sum(t==0 and p==1 for t,p in zip(y_true,y_pred))
    FN = sum(t==1 and p==0 for t,p in zip(y_true,y_pred))
    TN = sum(t==0 and p==0 for t,p in zip(y_true,y_pred))

    P  = TP/(TP+FP) if TP+FP else 0
    R  = TP/(TP+FN) if TP+FN else 0
    F1 = 2*P*R/(P+R) if P+R else 0
    return {"precision":round(P,4),"recall":round(R,4),"f1":round(F1,4)}

print(metrics([1,0,1,1,0,1],[1,0,1,0,0,1]))` },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  "frontend developer": {
    theoretical: [
      { q:"What is the virtual DOM in React and why does it improve performance?", difficulty:"Medium", company:"Meta", source:"InterviewBit",
        a:`The Virtual DOM is an in-memory JavaScript representation of the real DOM.

How React uses it:
  1. State changes → React creates a new Virtual DOM tree
  2. Diffing (reconciliation): compares new vs old Virtual DOM
  3. Minimal changes are batched and applied to the real DOM

Why it's faster:
  Real DOM operations (layout, paint, composite) are expensive.
  JavaScript operations are ~100x faster.
  Batching groups multiple state updates into one DOM write.

React 18 improvements:
  - Concurrent mode: interruptible rendering
  - Automatic batching: groups even async state updates
  - useTransition: mark non-urgent updates` },

      { q:"Explain event bubbling and capturing. How do you stop propagation?", difficulty:"Easy", company:"Amazon", source:"GeeksforGeeks",
        a:`Capture phase (top → target): event travels from window DOWN to the target.
Bubble phase (target → top): event travels FROM target UP to window. Default for most listeners.

Example: clicking a <button> inside <div>:
  Capture: window → body → div → button
  Bubble:  button → div → body → window

event.stopPropagation() — stops bubbling/capturing to parent listeners.
event.stopImmediatePropagation() — stops all other handlers on the current element.
event.preventDefault() — prevents default browser action (form submit, link), does NOT stop propagation.

Event delegation uses bubbling intentionally: one parent listener handles all children.` },

      { q:"What is the difference between useMemo and useCallback in React?", difficulty:"Medium", company:"Airbnb", source:"InterviewBit",
        a:`Both memoize values to avoid unnecessary recalculation on re-renders.

useCallback(fn, deps):
  Memoizes a FUNCTION reference. Returns the same function instance if deps unchanged.
  Use when passing callbacks to React.memo-wrapped child components.

useMemo(fn, deps):
  Memoizes the RETURN VALUE of a function.
  Use when you have an expensive calculation that shouldn't run on every render.

When NOT to use:
  Don't add these for cheap operations — the memoization overhead may be WORSE.
  Measure with React Profiler first, then optimise.` },
    ],

    aptitude: [
      { q:"A React component re-renders 60 times/sec during animation. How many renders in 10 seconds?", difficulty:"Easy", source:"IndiaBix",
        a:`60 × 10 = 600 re-renders.

This is why animations should use CSS transitions (GPU-accelerated) or requestAnimationFrame,
NOT useState in a setInterval loop which triggers 600 reconciliation cycles per 10 seconds.` },
    ],

    coding: [
      { q:"Implement debounce from scratch in JavaScript.", difficulty:"Medium", company:"Uber", source:"InterviewBit",
        a:`function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

// Usage: fire API only 300ms after user stops typing
const debouncedSearch = debounce((query) => fetchResults(query), 300);
input.addEventListener('input', e => debouncedSearch(e.target.value));

// Compare: throttle fires at most once per interval
function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) { last = now; fn(...args); }
  };
}` },

      { q:"Write a custom React hook for data fetching with loading, error, and data states.", difficulty:"Medium", company:"Netflix", source:"GeeksforGeeks",
        a:`import { useState, useEffect, useCallback } from 'react';

function useFetch(url) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true); setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      setData(await res.json());
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [url]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, loading, error, refetch: fetchData };
}

// Usage:
function Profile({ id }) {
  const { data, loading, error } = useFetch(\`/api/users/\${id}\`);
  if (loading) return <div>Loading...</div>;
  if (error)   return <div>Error: {error}</div>;
  return <div>{data?.name}</div>;
}` },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  "backend developer": {
    theoretical: [
      { q:"What are ACID properties in database transactions?", difficulty:"Easy", company:"Oracle", source:"GeeksforGeeks",
        a:`A — Atomicity: transaction is ALL or NOTHING. Failure → entire rollback.
  Bank transfer: debit ₹500 + credit ₹500 must both succeed or both fail.

C — Consistency: transaction brings database from one valid state to another.
  All integrity constraints (FKs, unique) must hold after the transaction.

I — Isolation: concurrent transactions behave as if sequential.
  Levels: READ UNCOMMITTED < READ COMMITTED < REPEATABLE READ < SERIALIZABLE
  Two users booking the last seat shouldn't both succeed.

D — Durability: committed transactions persist even after a crash.
  Achieved via write-ahead logging (WAL) and fsync.` },

      { q:"What is the N+1 query problem? How do you detect and fix it?", difficulty:"Medium", company:"Shopify", source:"InterviewBit",
        a:`N+1 problem: 1 query to fetch N records + N additional queries for related data.

# BAD: N+1
posts = Post.objects.all()          # 1 query
for post in posts:
    print(post.author.name)         # 1 query per post = N queries

Detection: Django Debug Toolbar, SQLAlchemy query logging, APM tools (Datadog).

Fix: eager loading
# Django (JOIN):
posts = Post.objects.select_related('author').all()      # 1 SQL query
# Django (separate optimised query):
posts = Post.objects.prefetch_related('tags').all()

Result: 101 queries → 2 queries. Can be 100x performance improvement.` },
    ],

    aptitude: [
      { q:"An API processes 200 req/sec, each taking 50ms. How many requests are in-flight at any moment?", difficulty:"Medium", source:"IndiaBix",
        a:`Little's Law: L = λ × W = 200 × 0.05 = 10 concurrent requests.
Configure connection pool to at least 10, with buffer of 15-20 for burst traffic.` },
    ],

    coding: [
      { q:"Write Express.js middleware that rate-limits to 100 requests per minute per IP without a library.", difficulty:"Hard", company:"Cloudflare", source:"InterviewBit",
        a:`const rateLimitMap = new Map();

function rateLimiter(maxReq = 100, windowMs = 60_000) {
  return (req, res, next) => {
    const ip  = req.ip;
    const now = Date.now();
    if (!rateLimitMap.has(ip)) rateLimitMap.set(ip, []);

    const ts = rateLimitMap.get(ip).filter(t => t > now - windowMs);
    rateLimitMap.set(ip, ts);

    if (ts.length >= maxReq) {
      const retry = Math.ceil((ts[0] + windowMs - now) / 1000);
      return res.status(429).json({ error:'Too many requests', retryAfterSeconds:retry });
    }

    ts.push(now);
    res.set('X-RateLimit-Remaining', maxReq - ts.length);
    next();
  };
}

app.use(rateLimiter(100, 60_000));

// Clean up stale IPs periodically
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [ip, ts] of rateLimitMap)
    if (!ts.length || ts[ts.length-1] < cutoff) rateLimitMap.delete(ip);
}, 300_000);` },
    ],
  },
};

// Generic fallback
const GENERIC = {
  theoretical: [
    { q:"Walk me through a challenging project. What was your specific contribution and the outcome?", difficulty:"Medium",
      a:`Use the STAR method:
  S — Situation: 1-2 sentence context
  T — Task: what YOUR responsibility was
  A — Action: specific steps YOU took (use "I", not "we")
  R — Result: quantified outcome (%, ₹, time saved)

Common mistakes:
  - Saying "we" without clarifying your role
  - No quantified result
  - Too much context, not enough action detail` },
    { q:"How do you prioritise work when you have multiple competing deadlines?", difficulty:"Easy",
      a:`Eisenhower Matrix:
  Urgent + Important   → Do immediately
  Important, not urgent → Schedule
  Urgent, not important → Delegate
  Neither              → Eliminate

Practical:
  1. List all tasks with deadlines and time estimates
  2. Identify dependencies (what blocks others?)
  3. Communicate EARLY if a deadline is at risk
  4. Time-block: deep work mornings, meetings afternoons

Show that you communicate proactively, can negotiate scope, and don't context-switch constantly.` },
  ],
  aptitude: [
    { q:"A project needs 8 developers for 6 months. If 2 more join at month 3, when does it finish?", difficulty:"Medium", source:"IndiaBix",
      a:`Total work = 8 × 6 = 48 developer-months
Work done in first 3 months = 8 × 3 = 24 developer-months
Remaining = 48 - 24 = 24 developer-months
New team size = 10
Remaining time = 24 / 10 = 2.4 months
Total = 3 + 2.4 = 5.4 months (saves 0.6 months)

Brooks' Law: "Adding manpower to a late project makes it later" — new devs need onboarding and increase communication overhead.` },
  ],
  coding: [
    { q:"Implement FizzBuzz in a way that's extensible for new rules without changing existing code.", difficulty:"Medium", source:"GeeksforGeeks",
      a:`def fizzbuzz(n, rules=None):
    if rules is None:
        rules = [(3, "Fizz"), (5, "Buzz")]
    results = []
    for i in range(1, n + 1):
        output = "".join(label for div, label in rules if i % div == 0)
        results.append(output or str(i))
    return results

# Standard
print(fizzbuzz(15))

# Extensible: add Bazz for 7 — no change to fizzbuzz function
print(fizzbuzz(21, rules=[(3,"Fizz"),(5,"Buzz"),(7,"Bazz")]))

# This is the Open/Closed Principle: open for extension, closed for modification.` },
  ],
};


// ── POST /interview-questions/ ────────────────────────────────────────────

router.post("/interview-questions/", async (req, res) => {
  const role     = (req.body?.role     || "").trim();
  const division = (req.body?.division || "theoretical").trim().toLowerCase();

  if (!role) return res.json({ questions:[], total:0, role:"", division });
  if (!["aptitude","theoretical","coding"].includes(division))
    return res.status(400).json({ detail:"division must be aptitude, theoretical, or coding" });

  console.log(`[Interview] Role: '${role}' | Division: ${division}`);
  const questions = _getQuestions(role, division);
  console.log(`[Interview] Returned ${questions.length} questions`);
  return res.json({ questions, total:questions.length, role, division });
});


function _getQuestions(role, division) {
  const lower = role.toLowerCase();
  let bank = QUESTION_BANK[lower];
  if (!bank) {
    for (const [key, val] of Object.entries(QUESTION_BANK)) {
      if (lower.includes(key) || key.includes(lower)) { bank = val; break; }
    }
  }
  if (!bank) bank = GENERIC;
  return _shuffle([...(bank[division] || bank.theoretical || [])]);
}

function _shuffle(arr) {
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

module.exports = router;
