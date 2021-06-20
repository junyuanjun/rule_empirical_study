# Rule Empirical Study

This repo contains the study materials we used for the empirical study of rule understanding.

- `01_rule_visualization` contains the code of generating rule visualizations
- `02_study_analysis` contains the analysis code of study results.

## Rule Generation & Visualization

For the rule generation, we apply the algorithm proposed by Wang et al.[1]. 

We use the home equity line of credit (HELOC) dataset [2] provided by FICO for our training stages (tutorial, concept verification, task introduction, task verification). 

We generate rules based on PIMA Indian Diabetes dataset[3] for our actual test. To avoid the influence of prior knowledge in the task performance, we tell the participants we are using a fictitious data set. We change the features names into mineral names as shown in the table below:

| Feature nams in diabetes data | Feature names in test |
| ----------------------------- | --------------------- |
| Pregnancies                   | Iron                  |
| Glucose                       | Magnesium             |
| BloodPressure                 | Sodium                |
| SkinThickness                 | Zinc                  |
| Insulin                       | Potassium             |
| BMI                           | Vitamin A             |
| DiabetesPedigreeFunction      | Calcium               |
| Age                           | Copper                |

| Target names in diabetes data | Target names in test |
| ----------------------------- | -------------------- |
| non-diabetic                  | Low Risk             |
| diabetic                      | High Risk            |

## Test Questions

To simulate the process of humans understanding rules, we desinged the following two tasks. Task 1 (Prediction Estimation) simulates the cases  where we only know the feature values and want to estimate the outcome. Task 2 (Prediction Characterization) simulates the cases given an outcome, we need to summarize/characterize how the model makes such prediction.

#### Task 1: Prediction Estimation

1. (not used for analysis) What is the most common prediction for rules containing conditions that match a person’s diet with <u>a High value of *Potassium*</u>?
2. What is the most common prediction for rules containing conditions that match a person’s diet with <u>a Low value of *Vitamin A*</u>?
3. What is the most common prediction for rules containing conditions that match a person’s diet with <u>a Medium value of *Vitamin A*</u>?
4. What is the most common prediction for rules containing conditions that match a person’s diet with <u>a High value of *Magnesium*</u>  <b>and</b> <u>a High value of *Vitamin A*</u> ?
5. What is the most common prediction for rules containing conditions that match a person’s diet
           with <u>a Low value of *Copper*</u>  <b>and</b> <u>a Medium value of *Magnesium*</u>?
6.  What is the most common prediction for rules containing conditions that match a person’s diet
       with <u>a Medium value of *Magnesium*</u>  <b>and</b> <u>a Medium value of *Calcium*</u>?

### Task 2: Prediction Characterization

1. (not used for analysis) Considering only the rules that predict <b> High Risk</b>, what is the most common value for <u>Potassium</u>?
2. Considering only the rules that predict <b>Low Risk</b>, what is the most common value for <u>Vitamin A</u>?
3. Considering only the rules that predict <b>Low Risk</b>, what is the most common value for <u>Zinc</u>?
4. Considering only the rules that predict **High Risk**, what is the most common value combination for <u>Magnesium</u> and <u>Potassium</u> ?
5. Considering only the rules that predict **High Risk**, what is the most common value combination for <u>Copper</u> and <u>Calcium</u>?
6. Considering only the rules that predict **Low Risk**, what is the most common value combination for <u>Copper</u> and <u>Calcium</u>?

## Study Analysis

We follow the steps we stated in the [pre-registration form](https://osf.io/79ujk?view_only=63dde87519654c53abc3c06361fa05ba).

Performance Overview (absolute effect size):

![image](https://user-images.githubusercontent.com/9759891/95631075-0ce69980-0a51-11eb-82db-5525b23cbf89.png)



### Reference:

[1] Wang, T., Rudin, C., Doshi-Velez, F., Liu, Y., Klampfl, E. and MacNeille, P., 2017. A bayesian framework for learning rule sets for interpretable classification. The Journal of Machine Learning Research, 18(1), pp.2357-2393.

[2] [Explainable Machine Learning Challenge - FICO Community.](https://community.fico.com/s/explainable-machine-learning-challenge?tabset-3158a=2)

[3] Smith, J.W., Everhart, J.E., Dickson, W.C., Knowler, W.C. and Johannes, R.S., 1988, November. Using the ADAP learning algorithm to forecast the onset of diabetes mellitus. In *Proceedings of the Annual Symposium on Computer Application in Medical Care* (p. 261). American Medical Informatics Association.